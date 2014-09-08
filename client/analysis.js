var NEWSPAPER =
      {"LTN"       : "自由時報"
      ,"Apple"     : "蘋果日報"
      ,"UDN"       : "聯合新聞網"
      ,"ChinaTime" : "中國時報"
      }
  , drawLineChart = _.debounce(
      function(news, area) {
        //計算出議題新聞的最早與最晚時間
        var dates     = []
          , total     = {}
          , groupNews = {"total" : total}
          , days
          , maxNews
          ;

        console.log("drawing...");
        _.each(
          news
        , function(d) {
            var time      = d.newsTime
              , newspaper = d.newspaper
              , groupData = groupNews[ newspaper ]
              , date
              ;
            
            //時間皆設置為當天0時
            time.setHours(0,0,0,0);
            //轉日期為字串
            date = time.format("yyyy/MM/dd");
            d.newsTime = date;

            if (total[ date ]) {
              total[ date ] += 1;
            }
            else {
              total[ date ] = 1;
              dates.unshift(date);
            }

            if (groupData) {
              if (groupData[ date ]) {
                groupData[ date ] += 1;
              }
              else {
                groupData[ date ] = 1;
              }
            }
            else {
              groupNews[ newspaper ] = (groupData = {});
              groupData[ date ] = 1;
            }
          }
        );

        days = _.size(dates);
        maxNews = _.max(total);

        //與邊欄間距固定
        var left   = 40
          , right  = 40
          , top    = 20
          , bottom = 20
          //寬度等於新聞持續天數x40
          , width  = days * 40 + 200 + left + right
          //高度視每日最高新聞數而定
          , height = (maxNews + 5) * 2 + top + bottom
          , x      = 
              d3.scale
                .linear()
                .domain( [0, days + 1] )
                .range( [0, width] )
          , y      =
              d3.scale
                .linear()
                .domain( [0, maxNews] )
                .range( [height, 0] )
          , xAxis  =
              d3.svg
                .axis()
                  .scale(x)
                  .ticks( days )
                  .orient("bottom")
          , yAxis  =
              d3.svg
                .axis()
                .scale(y)
                .ticks( Math.ceil(maxNews / 5) )
                .orient("left")
          , line   = 
              d3.svg
                .line()
                .x(
                  function(d) {
                    return x(d.date); 
                  }
                )
                .y(
                  function(d) {
                    return y(d.number); 
                  }
                )
          ;
        //製造svg
        svg =
          d3.select(area)
            .append("svg")
              .attr("width",  width + left + right)
              //高度固定
              .attr("height", height + top + bottom)
              .append("g")
                .attr("transform", "translate(" + left + "," + top + ")");
        //x軸
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .append("text")
            .text("日期")
            .attr("transform", "translate(" + width +  ", 0)");
        //y軸
        svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "translate(" + left + ",-7)")
              .style("text-anchor", "end")
              .text("新聞數量");


        //畫線
        _.each(
          groupNews
        , function(dateNews, newspaper) {
            var groupData = groupNews[ newspaper ]
              , svgData   =
                  _.map(
                    dates
                  , function(date, index) {
                      return {
                       "date"   : index + 1
                      ,"number" : groupData[date] || 0
                      };
                    }
                  )
              ;
            svg.append("path")
               .attr("class", "line " + newspaper)
               .attr("d", line(svgData));
          }
        );
      }
    , 1000
    )

  ;
Template.analysis.helpers(
  {"svgDataCompute" :
      function(topicId) {
        var filter      =
              {"topicId" : topicId
              }
          , options =
              {"sort"    :
                  {"newsTime"  : -1
                  }
              ,"fields"  :
                  {"newspaper" : 1
                  ,"newsTime"  : 1
                  ,"title"     : 1
                  ,"sourceUrl" : 1
                  }
              }
          , news       = DB.news.find(filter, options)
          , oldestTime = Infinity
          , newestTime = -Infinity
          , oldestDate
          , newestDate
          , tempDate
          , result
          ;

        if (news.count() < 1) {
          return false;
        }

        //計算出議題新聞的最早與最晚時間
        news.forEach(function(doc) {
          var time = doc.newsTime.getTime();
          if (time < oldestTime) {
            oldestTime = time;
          }
          if (time > newestTime) {
            newestTime = time;
          }
        });
        oldestDate = new Date(oldestTime).getDayStart();
        newestDate = new Date(newestTime).getDayEnd();

        //訂閱議題新聞期間的所有新聞
        tempDate = new Date(newestDate);
        while (tempDate.getTime() >= oldestDate.getTime()) {
          Meteor.subscribe("unAssignNews", tempDate);
          tempDate.setDate( tempDate.getDate() - 1 );
        }

        filter =
          {"newsTime" :
              {"$gte" : oldestDate
              ,"$lte" : newestDate
              }
          };
        result = DB.news.find(filter, options).fetch();
        if (result.length) {
          analysisData.set( result );
        }
      }
  ,"drawLineChart"  :
      function(topicId) {
        var areaId      = "#analysisLineChart"
          , $svg        = $(areaId)
          , filter      =
              {"topicId" : topicId
              }
          , options     =
              {"sort"    :
                  {"newsTime"  : -1
                  }
              ,"fields"  :
                  {"newspaper" : 1
                  ,"newsTime"  : 1
                  ,"title"     : 1
                  ,"sourceUrl" : 1
                  }
              }
          , news        = DB.news.find(filter, options)
          ;

        if (news.count() > 0 || $svg.length > 0) {
          $svg.empty();
          drawLineChart(news.fetch(), $svg[0]);
        }
      }
  ,"news"           :
      function(topicId) {
        var filter      =
              {"topicId" : topicId
              }
          , options =
              {"sort"    :
                  {"newsTime"  : -1
                  }
              ,"fields"  :
                  {"newspaper" : 1
                  ,"newsTime"  : 1
                  ,"title"     : 1
                  ,"sourceUrl" : 1
                  }
              }
          , news       = DB.news.find(filter, options)
          ;
        return news;
      }
  }
);


Template.eachNews_Analysis.helpers(
  {"showDate" :
      function(date) {
        return date.format("yyyy/MM/dd HH:mm");
      }
  ,"newsPaperName" :
      function(newsPaper) {
        return NEWSPAPER[newsPaper];
      }
  }
);