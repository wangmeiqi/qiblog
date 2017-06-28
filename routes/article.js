
var express = require('express');
//导入操作数据库的用户集合的模型
var Article = require('../db').Article;
var checkLogin = require('../auth').checkLogin;
// var multer=require('multer');
// var upload=multer({dest:'public/'});
//这是一个工厂函数,返回一个路由容器实例
var router = express.Router();
var util = require('../util');
var Send = util.Send;

var mardown = require('markdown').markdown;

// var md5 = util.md5;
// var getDefineObj = util.getDefineObj;

//注册 /user/signup
//路径一定以/开头 模板路径一定不要以/开头
/**
 * 1. 编写注册模板 用户名 密码 邮箱
 * 2. 点击提交按钮提交到后台 post /signup
 * 3. 在/signup里，接收传过来的表单数据，通过body-parser中间件来将请求体放在 req.body上。
 * 4. 引入User模型，然后把此对象保存到数据库中
 */

//处理注册用户时的表单提交
router.post('/add', checkLogin,function (req, res) {
	//取得请求体对象
	var user = req.session.user;
	var curArticle = req.body;
	curArticle.type = parseInt(curArticle.type);
	curArticle.markdown = mardown.toHTML(curArticle.content);
	curArticle.createTime = Date.now();
	curArticle.updateTime = Date.now();
	curArticle.decorate = getDecorate();
	curArticle.user = user._id;
	Article.create(curArticle, function (err, doc) {
		if (err) {
			res.send(Send.s5(err));
		} else {
			//把保存后的对象作为req.session属性,session对象是在服务器端内存里放置
			res.send(Send.s2(doc));
		}
	})
});
//处理注册用户时的表单提交
router.post('/list', function (req, res) {
	var search = req.body.search;
	console.log(search);
	var reg = new RegExp(search, 'i');
	var queryObj = {$or: [{title: reg}, {content: reg}]};
	//取得请求体对象
	Article.find(queryObj).populate('user').exec(function (err, articles) {
		if (err) {
			res.send(Send.s5(err));
		} else {
			res.send(Send.s2({articles: articles}));
		}
	});
});
function getDecorate() {
	return 'articleImg/img' + Math.ceil(Math.random() * 7) + '.png';
}
module.exports = router;