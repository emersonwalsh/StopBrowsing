// TODO Next
// add color with genres (multiple series)
// get multiple pages of data

'use strict'

var myApp = angular.module('myApp', []);

myApp.controller('stopBrowsingController', function($scope, $http) {
    var myChart,
        config = {};
    
    // Variables

    $scope.stopBrowsing = {};
    $scope.stopBrowsing.genreMapping = {};
    $scope.stopBrowsing.legendData = [];
    $scope.stopBrowsing.kpis = [
        {
            name: 'Rotten Tomatoes',
            img: 'resources/img/kpi/RT.png'
        },
        {
            name: 'IMBd',
            img: 'resources/img/kpi/IMBd.png'
        }
    ];
    $scope.stopBrowsing.selectedKPI = {
        x: 'IMBd',
        y: 'Rotten Tomatoes'
    };
    $scope.stopBrowsing.providers = [
        {
            name: 'Netflix',
            img: 'resources/img/providers/Netflix.png'
        },
        {
            name: 'Amazon',
            img: 'resources/img/providers/Amazon.png'
        },
        {
            name: 'Hulu',
            img: 'resources/img/providers/Hulu.png'
        }
    ];
    $scope.stopBrowsing.selectedProvider = 'Netflix';
    $scope.stopBrowsing.genres = [
        {
            name: 'Action-Adventure',
            img: ''
        },
        {
            name: 'Drama',
            img: ''
        },
        {
            name: 'Comedy',
            img: ''
        },
        {
            name: 'Horror',
            img: ''
        },
        {
            name: 'Documentary',
            img: ''
        }
    ];
    $scope.stopBrowsing.selectedGenre = 'Action-Adventure';
    $scope.stopBrowsing.dimensions = {
        critics: 0,
        audience: 1
    };
    $scope.stopBrowsing.apiKey = 'eccb4da8e3b343fe9a8a91ec1785b9a7';
    $scope.stopBrowsing.colorPalette = [
        '#4ac481',
        '#ee6565'
    ]

    // Function
    $scope.stopBrowsing.startTour = startTour;
    $scope.stopBrowsing.selectProvider = selectProvider;

    /**
     * Start the product tour
     */
    function startTour() {
        introJs().setOptions({
            "exitOnOverlayClick": true,
            "showProgress": false,
            "showBullets": true,
            "showStepNumbers": false,
            "scrollPadding": 0,
            "scrollToElement": false
        }).start();

        // Save to localStorage
        localStorage.setItem('tour', true)
    }

    /**
     * Set the provider
     */
    function selectProvider(provider) {
        $scope.stopBrowsing.selectedProvider = provider;
        getMovies();
    }

    /**
     * Get mapping of genres.
     */
    function getGenres() {
        var url = '',
            i;

        url += 'https://api.themoviedb.org/3/genre/movie/list?api_key=' + $scope.stopBrowsing.apiKey;

        $http({
            url: url,
            method: 'GET'
        }).then(function (response) {
            for (i = 0; i < response.data.genres.length; i++) {
                $scope.stopBrowsing.genreMapping[response.data.genres[i].id] = response.data.genres[i].name;
            }
            getMovies();
        }, function (error) {
            console.error(error);
            getMovies();
        });
    }

    /**
     * Get list of popular movies.
     */
    function getMovies() {
        var url = '',
            i,
            pages = 4;

            url += 'https://api.themoviedb.org/3/';
            url += 'trending/';
            url += 'movie/';
            url += 'week?';
            url += 'api_key=' + $scope.stopBrowsing.apiKey;

        // for (i = 0; i < pages; i++) {
            $http({
                url: url,
                method: 'GET'
            }).then(function (response) {
                formatData(response.data);
            }, function (error) {
                console.error(error);
            });
        // }

    }

    /**
     * Parse through stock data using response from Aplha Vantage API.
     */
    function formatData(rawData) {
        var i,
            genres = [],
            data = [];
        
        for (i = 0; i < rawData.results.length; i++) {
            genres.push($scope.stopBrowsing.genreMapping[rawData.results[i].genre_ids[0]]);
            data.push({
                name: rawData.results[i].title,
                value: [rawData.results[i].popularity, rawData.results[i].vote_count],
                img: 'https://image.tmdb.org/t/p/w500/' + rawData.results[i].poster_path,
                movieID: rawData.results[i].id,
                genre: $scope.stopBrowsing.genreMapping[rawData.results[i].genre_ids[0]]
            });
        }

        $scope.stopBrowsing.legendData = genres.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        $scope.stopBrowsing.data = data;

        paint();
    }

    
    /**
     * Paint the candle stick visualization.
     */
    function paint() {
        var option = {
            grid: {
                top: 100,
                right: 120,
                bottom: 100,
                left: 120
            },
            // legend: {
            //     show: false,
            //     right: 'center',
            //     bottom: 20,
            //     data: ['Nominated', 'Not Nominated']
            // },
            color: ['#4ac481', '#ee6565'],
            tooltip: {
                show: true,
                formatter: function (info) {
                    var html = '';
                    if (info.seriesType === 'scatter') {
                        html += info.marker;
                        html += '<b>' + info.name + '</b><br>';
                        html += 'Critics: ' + info.data.value[$scope.stopBrowsing.dimensions.critics] + '<br>';
                        html += 'Audience: ' + info.data.value[$scope.stopBrowsing.dimensions.audience] + '<br>';
                        html += '<div style="width: 100%; text-align: center">'
                        html += '<img style="height: 150px; width: auto;" src="' + info.data.img + '"></div>'
                        return html;
                    }

                    if (info.componentType === 'markLine') {
                        html += info.marker;
                        html += 'Fresh Threshold';
                        return html;
                    }
                }
            },
            xAxis: {
                name: 'Number of Votes',
                type: 'value',
                // min: 0,
                // max: 1,
                nameLocation: 'center',
                nameGap: 45,
                nameTextStyle: {
                    fontSize: 12,
                    color: 'black'
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                name: 'Popularity',
                type: 'value',
                // min: 0,
                // max: 1,
                nameLocation: 'center',
                nameGap: 45,
                nameTextStyle: {
                    fontSize: 12,
                    color: 'black'
                },
                splitLine: {
                    show: false
                }
            },
            animationEasingUpdate: 'cubicInOut',
            animationDuration: 2000,
            series: [{
                type: 'scatter',
                name: 'Nominated',
                animation: true,
                symbol: 'circle',
                data: $scope.stopBrowsing.data,
                itemStyle: {
                    normal: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(25, 100, 150, 0.5)',
                        shadowOffsetY: 5,
                        normal: {
                            color: function (param) {
                                return json[0].marker.color[param.dataIndex];
                            }
                        }
                        // color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                        //     offset: 0,
                        //     color: 'rgb(129, 227, 238)'
                        // }, {
                        //     offset: 1,
                        //     color: 'rgb(25, 183, 207)'
                        // }])
                    }
                }
            }
            // {
            //     type: 'line',
            //     name: 'Thresholds',
            //     data: [],
            //     markLine: {
            //         symbol: 'none',
            //         data: [{
            //             name: 'Fresh',
            //             xAxis: 0.6,
            //             lineStyle: {
            //                 color: '#1a73e8',
            //                 type: 'dotted',
            //                 opacity: 0.5
            //             },
            //             label: {
            //                 show: false
            //             }
            //         }, {
            //             name: 'Fresh',
            //             yAxis: 0.6,
            //             symbol: 'none',
            //             lineStyle: {
            //                 color: '#1a73e8',
            //                 type: 'dotted',
            //                 opacity: 0.5
            //             },
            //             label: {
            //                 show: false
            //             }
            //         }]
            //     }
            // }
            ]
        };

        myChart.setOption(option);
        
        // handle click event
        myChart.on('click', function (info) {
            var url = 'https://www.themoviedb.org/movie/';
            url += info.data.movieID;
            window.open(url, '_blank');        
        });
    }
    
    /**
     * Initial Function
     */
    function initialize() {
        var productTour = localStorage.getItem('tour');

        // Start product tour if first time for user
        if (!productTour) {
            startTour();
        }
        myChart = echarts.init(document.getElementById('chart'));
        getGenres();
    }

    // Listeners
    window.addEventListener('resize', function() {
        if (myChart) {
            myChart.resize();
        }
    });

    initialize();
});