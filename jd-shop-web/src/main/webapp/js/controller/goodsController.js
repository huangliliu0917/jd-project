 //控制层 
app.controller('goodsController' ,function($scope,$controller,$location,goodsService,uploadService,itemCatService,typeTemplateService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	}    
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}
	
	//查询实体 
	$scope.findOne=function(){
		//获取到要查询的商品对象的id
		var id = $location.search()['id'];//获取参数
		//alert(id);
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;
				//向富文本编辑器中添加商品介绍
				editor.html($scope.entity.goodsDesc.introduction);
				//将商品图片字符串，转成JSON对象
				$scope.entity.goodsDesc.itemImages = JSON.parse($scope.entity.goodsDesc.itemImages);
				//将扩展属性字符串，转成json对象
				$scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.entity.goodsDesc.customAttributeItems);
				//将规格转换成json对象
				$scope.entity.goodsDesc.specificationItems = JSON.parse($scope.entity.goodsDesc.specificationItems);
				//sku列表规格列 转换
				for (var i = 0; i < $scope.entity.itemList.length; i++) {
					$scope.entity.itemList[i].spec = JSON.parse($scope.entity.itemList[i].spec);
				}
			}
		);
	}
	
	//保存 
	$scope.save=function(){
		//获取富文本编辑器中的内容
		$scope.entity.goodsDesc.introduction = editor.html();
		$scope.entity.goodsDesc.itemImages = JSON.stringify($scope.entity.goodsDesc.itemImages);
		//将扩展属性json对象，装换成json字符串再存储
		$scope.entity.goodsDesc.customAttributeItems = JSON.stringify($scope.entity.goodsDesc.customAttributeItems);
		//将规格选项转换成json字符串
		$scope.entity.goodsDesc.specificationItems = JSON.stringify($scope.entity.goodsDesc.specificationItems);
		//遍历itemList将spec转成字符串
		if ($scope.entity.itemList != null){
			for (var i = 0;i < $scope.entity.itemList.length;i++){
				$scope.entity.itemList[i].spec = JSON.stringify($scope.entity.itemList[i].spec);
			}
		}

		var serviceObject;//服务层对象
		if($scope.entity.goods.id!=null){//如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改  
		}else{
			serviceObject=goodsService.add( $scope.entity  );//增加 
		}				
		serviceObject.success(
			function(response){
				if(response.success){
					window.location.href = "goods.html"; //添加或修改后到商品查询列表
					/*alert("保存成功");
					//保存成功后清楚添加框里面的内容
					$scope.entity = {};
					editor.html(""); //清除富文本编辑器中的内容*/
				}else{
					alert(response.message);
				}
			}		
		);				
	}
	
	 
	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}						
			}		
		);				
	}
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}


	//商品添加
	$scope.add = function () {
		//获取富文本编辑器中的内容
		$scope.entity.goodsDesc.introduction = editor.html();
		$scope.entity.goodsDesc.itemImages = JSON.stringify($scope.entity.goodsDesc.itemImages);
		//将扩展属性json对象，装换成json字符串再存储
		$scope.entity.goodsDesc.customAttributeItems = JSON.stringify($scope.entity.goodsDesc.customAttributeItems);
		//将规格选项转换成json字符串
		$scope.entity.goodsDesc.specificationItems = JSON.stringify($scope.entity.goodsDesc.specificationItems);
		//遍历itemList将spec转成字符串
		if ($scope.entity.itemList != null){
			for (var i = 0;i < $scope.entity.itemList.length;i++){
				$scope.entity.itemList[i].spec = JSON.stringify($scope.entity.itemList[i].spec);
			}
		}

		goodsService.add($scope.entity).success(function (response) {
			if (response.success){
				alert("保存成功");
				//保存成功后 清除添加框里面的内容
				$scope.entity = {};
				editor.html(""); //清除富文本编辑器中的内容
			}else {
				alert(response.message);
			}
		});
	}

	//上传图片
	$scope.uploadFile = function () {
		uploadService.uploadFile().success(function (response) {
			if (response.success){
				//上传成功
				$scope.image_entity.url = response.message; //设置文件地址
			}else {
				//上传失败
				alert(response.message);
			}
		}).error(function () {
			alert("上传错误");
		})
	}

	//定义页面实体结构
	$scope.entity = {goods:{},goodsDesc:{itemImages:[],specificationItems:[]}};

	//添加图片列表
	$scope.add_image_entity = function () {
		$scope.entity.goodsDesc.itemImages.push($scope.image_entity);
	}

	//从列表中移除图片
	$scope.remove_image_entity = function (index) {
		$scope.entity.goodsDesc.itemImages.splice(index,1);
	}

	//读取一级分类
	$scope.selectItemCat1List = function () {
		itemCatService.findByParentId(0).success(function (response) {
			$scope.itemCat1List = response;
		})
	}

	//当一级分类发生改变的时候，查询二级分类
	$scope.$watch('entity.goods.category1Id',function (newValue,oldValue) {
		//alert("newValue:"+newValue+",oldValue:"+oldValue);
		//根据选择的一级分类的ID 来查询二级分类
		itemCatService.findByParentId(newValue).success(function (response) {
			$scope.itemCat2List = response;
		})
	});

	//当二级分类发生变化的时候 查询三级分类
	$scope.$watch('entity.goods.category2Id',function (newValue,oldValue) {
		//alert("newValue:"+newValue+",oldValue:"+oldValue);
		//根据选择的一级分类的ID 来查询二级分类
		itemCatService.findByParentId(newValue).success(function (response) {
			$scope.itemCat3List = response;
		})
	});

	//当选择三级分类后，读取模板ID号
	$scope.$watch('entity.goods.category3Id',function (newValue,oldValue) {
		itemCatService.findOne(newValue).success(function (response) {
			$scope.entity.goods.typeTemplateId = response.typeId; //获取到了模板ID
		})
	});

	//模板ID得到后，查询出品牌列表
	$scope.$watch('entity.goods.typeTemplateId',function (newValue,oldValue) {
		typeTemplateService.findOne(newValue).success(function (response) {
			//获取到类型模板
			$scope.typeTemplate = response;
			//获取到了类型模板,得到品牌列表
			$scope.typeTemplate.brandIds = JSON.parse($scope.typeTemplate.brandIds);
			//同时可以确定自定义属性(扩展属性)
			//如果没有id则加载该代码（避免与findOne中起到冲突）
			if ($location.search()['id'] == null){
				$scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.typeTemplate.customAttributeItems);
			}
		});
		//查询规格列表
		typeTemplateService.findSpecList(newValue).success(function (response) {
			$scope.specList = response;
			//alert(JSON.stringify($scope.specList));
		})
	})

	//当勾选规格列表的时候，更新数组
	$scope.updateSpecAttribute = function ($event,name,value) {
		var object = $scope.searchObjectByKey($scope.entity.goodsDesc.specificationItems,'attributeName',name);
		if (object != null){
			//存在
			if ($event.target.checked){
				//勾选
				object.attributeValue.push(value);
			}else{
				//取消勾选
				object.attributeValue.splice(object.attributeValue.indexOf("value"),1);//移除选项
				//如果所有的选项都取消了，那么此条记录也该删除
				if (object.attributeValue.length == 0){
					$scope.entity.goodsDesc.specificationItems.splice($scope.entity.goodsDesc.specificationItems.indexOf(object),1);
				}
			}

		}else {
			//不存在
			$scope.entity.goodsDesc.specificationItems.push({"attributeName":name,"attributeValue":[value]});
		}
	}

	//创建sku
	$scope.createItemList = function () {
		//初始化sku
		$scope.entity.itemList = [{spec:{},price:0,num:9999,status:'0',idDefault:'0'}];
		var items = $scope.entity.goodsDesc.specificationItems;
		for (var i = 0;i<items.length;i++){
			//深克隆
			$scope.entity.itemList = addColumn($scope.entity.itemList,items[i].attributeName,items[i].attributeValue);
		}
	}

	//添加列
	addColumn = function (list,columnName,columnValues) {
		var  newList = [];
		for (var i = 0;i<list.length;i++){
			var oldRow = list[i];
			for (var j=0;j<columnValues.length;j++){
				//深克隆
				var newRow = JSON.parse(JSON.stringify(oldRow));
				newRow.spec[columnName] = columnValues[j];
				newList.push(newRow);
			}
		}
		return newList;
	}

	//商品状态
	$scope.status = ['未审核','已审核','审核未通过','关闭'];

	//定义商品分类列表(准备从数据库查询，只要查询一次，然后将数据放入内存中，提高性能)
	$scope.itemCatList = [];

	//加载商品分类列表
	$scope.findItemCatList = function () {
		itemCatService.findAll().success(function (response) {
			for (var i = 0; i < response.length; i++) {
				//挨个取出itemCat
				var itemCat = response[i];
				$scope.itemCatList[itemCat.id] = itemCat.name;
			}
		});
	}

	//判定规格列表是否勾选
	$scope.checkAttributeValue = function (specName,optionName) {
		//tb_goods_desc表中specification_items可以查询出来,然后盘对和规格选项列表 是否一致，如果一致返回true 反之false
		var item = $scope.entity.goodsDesc.specificationItems;
		var object = $scope.searchObjectByKey(item,'attributeName',specName);
		if (object == null){
			return false;
		}else {
			if (object.attributeValue.indexOf(optionName) >= 0){
				return true;
			}else {
				return false;
			}
		}
		return false;
	}

});	
