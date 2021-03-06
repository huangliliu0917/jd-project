app.controller('contentController',function ($scope,contentService) {
    //初始化广告列表的集合
    $scope.contentList =[];  //将所有的广告都放在这个集合中
    //根据广告分类id 查询广告列表
    $scope.findByCategoryId = function (categoryId) {
        contentService.findByCategoryId(categoryId).success(function (response) {
            $scope.contentList[categoryId] = response;
        })
    }

    //搜索跳转
    $scope.search = function () {
        location.href = "http://localhost:9235/search.html#?keywords="+$scope.keywords;
    }

    //获取到当前登录的用户名
    $scope.showName = function () {
        contentService.showName().success(function (response) {
            $scope.loginName = response.loginName;
            //alert($scope.loginName);
        })
    }

})