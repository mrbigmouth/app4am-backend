var NEWSPAPER     =
      {"LTN"       : "自由時報"
      ,"Apple"     : "蘋果日報"
      ,"UDN"       : "聯合新聞網"
      ,"ChinaTime" : "中國時報"
      ,"total"     : "總報導"
      }
  , getTopic      = _.memoize(
        function(hexId) {
          return DB.topic.findOne( new Mongo.ObjectID(hexId + "") );
        }
      )
  , pieTracker
  , drawLineChart = _.debounce(
      function(news, area) {
        //計算出議題新聞的最早與最晚時間
        var dates     = []
          , total     = {}
          , groupNews = {"total" : total}
          , days
          , maxNews
          ;

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
        var left      = 40
          , right     = 40
          , top       = 20
          , bottom    = 20
          , dayWidth  = 50
          //寬度等於新聞持續天數
          , width     = days * dayWidth + 200 + left + right
          //高度視每日最高新聞數而定
          , height    = (maxNews + 5) * 2 + top + bottom
          , x         = 
              d3.scale
                .linear()
                .domain( [0, days + 1] )
                .range( [0, width] )
          , y         =
              d3.scale
                .linear()
                .domain( [0, maxNews] )
                .range( [height, 0] )
          , xAxis     =
              d3.svg
                .axis()
                  .scale(x)
                  .ticks( days )
                  .tickFormat( function(d) { return d ? dates[ d - 1 ] : ""; } )
                  .orient("bottom")
          , yAxis     =
              d3.svg
                .axis()
                .scale(y)
                .ticks( Math.ceil(maxNews / 5) )
                .orient("left")
          , line      = 
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
        var svg =
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

        var count = 0;
        //對各別新聞的數據作處理
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
              , point
              ;
            //畫線
            svg.append("path")
               .attr("class", "line " + newspaper)
               .attr("d", line(svgData));

            //上說明文字
            svg.append("text")
               .attr("class", "text " + newspaper)
               .attr("x", width - dayWidth)
               .attr("y", count * 20)
               .text( NEWSPAPER[ newspaper ] );
            count += 1;

            //每日轉折處加點
            point = 
              svg.selectAll("circle." + newspaper)
                .data(svgData)
                .enter()
                .append("g")
                .append("circle")
                .attr("class", "point " + newspaper)
                .attr("cx", line.x())
                .attr("cy", line.y())
                .attr("r", 3.5)
                //滑鼠移過時變大並顯示說明文字
                .on("mouseover", function() {
                  var dThis = d3.select(this)
                    , data  = dThis.data()
                    ;
                  dThis.transition().duration(500).attr("r", 8);
                })
                .on("mouseout", function() {
                  d3.select(this).transition().duration(500).attr("r", 3.5);
                })
                .on("click", function() {
                  var day  = d3.select(this).data()[0].date
                    , date = new Date( Date.parse( dates[ day - 1 ] ) )
                    ;


                  $("#analysisPieChart").empty().html("<div style=\"text-align:center;margin-top:100px;font-size:22px;\">載入中。。。</div>");
                  Meteor.subscribe("newsByNewspaperDate", newspaper === "total" ? "" : newspaper, date);
                  if (pieTracker) {
                    pieTracker.stop();
                  }
                  pieTracker = Tracker.autorun(
                    function() {
                      var filter = {};
                      if (newspaper !== "total") {
                        filter.newspaper = newspaper
                      }
                      filter.newsTime =
                          {"$gte" : date.getDayStart()
                          ,"$lte" : date.getDayEnd()
                          };
                      drawPieChart(newspaper, date, DB.news.find(filter));
                    }
                  );
                });
          }
        );
      }
    , 1000
    )
  , drawPieChart  = _.debounce(
      function(newspaper, date, cursor) {
        var left      = 40
          , right     = 40
          , top       = 20
          , bottom    = 20
          , width     = 400
          , height    = 400
          , radius    = Math.min(width, height) / 2
          , color     =
              d3.scale.ordinal()
                .range(
                  ["#1f77b4"
                  ,"#ff7f0e"
                  ,"#2ca02c"
                  ,"#d62728"
                  ,"#9467bd"
                  ,"#8c564b"
                  ,"#e377c2"
                  ,"#7f7f7f"
                  ,"#bcbd22"
                  ,"#17becf"
                  ]
                )
          , arc       = d3.svg.arc().outerRadius(radius - 10).innerRadius(0)
          , pie       = d3.layout.pie().sort(null).value(function(d) { return d.number; })
          , data      = {}
          , svgData
          , svg
          ;


        cursor.forEach(
          function(doc) {
            var topic     = doc.topicId && doc.topicId.length ? getTopic( doc.topicId[0] ) : null
              , topicName = topic ? topic.name : "其他新聞"
              ;

            if (data[ topicName ]) {
              data[ topicName ] += 1;
            }
            else {
              data[ topicName ] = 1;
            }
          }
        );

        svgData = _.map(data, function(number, topic) { return {"topic" : topic, "number" : number}; });
        $("#analysisPieChart").empty();
        svg =
            d3.select("#analysisPieChart").append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g")
              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        pie = pie(svgData);
        _.each(
          svgData
        , function(data, index, svgData) {
            var g = svg.selectAll(".arc").data(pie).enter().append("g").attr("class", "arc");

            g.append("path")
              .attr("d", arc)
              .style("fill", function(d) { return color(d.data.topic); });

            g.append("text")
              .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .style("text-anchor", "middle")
              .text(function(d) { return d.data.topic + " " + d.data.number; });
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
  ,"nowTopicId" :
      function(topic) {
        return topic._id._str;
      }
  }
);

Template.eachNews_Analysis.events(
  {"click a.remove" :
      function(e, ins) {
        var newId   = $(e.currentTarget).attr("data-id")
          , topicId = $(e.currentTarget).attr("data-topic")
          ;

        DB.news.update(
          new Mongo.ObjectID(newId)
        , {"$pull" :
            {"topicId"  : new Mongo.ObjectID(topicId)
            }
          }
        );
      }
  }
);
