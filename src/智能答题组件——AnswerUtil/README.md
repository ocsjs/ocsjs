 # 智能答题组件——AnswerUtil


## 说明：
传入 ：题目，答案，多个选项
即可返回较为正确的选项索引。

```javascript
var a = new AnswerUtil('题目',回答Array[],选项Array[]);
a.getAnswer();//获得匹配的选项的下标索引。
```
动态引入url提供：[http://c.ykhulian.com:81/resourse/src/AnswerUtil-1.0.0.js](http://c.ykhulian.com:81/resourse/src/AnswerUtil-1.0.0.js)
## 运行实例：
###  一（复杂判断）：
```javascript
var a = new AnswerUtil('中国是什么', ["中华人民共和国（People's Republic of China），简称“中国”"], [
    "A,,SAD中华人民共和国（People's Republic of），简称“中国”",
    "B,C,D中华人民共和国（People's Republic of China），“中国”",
    "C,D中华人民共和国（People's Republic of China），称“中国”",
    "D,DD,中华人民共和国（People Republic of China），简称“中国”"
]);
a.getAnswer()//获得回答
```
__运行结果：Array(1)： [2]__
```javascript
var a = new AnswerUtil('1的英文', ["one","One","ONE"], [
    "tow",
    "three",
    "ONe",
    "four"
]);
a.getAnswer()
```
__运行结果：Array(1)： [2]__

### 二（直接给出答案）：
```javascript
var a = new AnswerUtil('中国是什么', ["CD"], [
    "A,,SAD中华人民共和国（People's Republic of），简称“中国”",
    "B,C,D中华人民共和国（People's Republic of China），“中国”",
    "中华人民共和国（People's Republic of China），称“中国”",
    "中华人民共和国（People's Republic of China），简称“中国”"
]);
a.getAnswer()
```
__运行结果：Array(2)： [2, 3]__

## 三（多选）：
```javascript
var a = new AnswerUtil('法律部门都有哪些', ["宪法","刑法","民商法"], [
    "行政法",
    "刑法",
    "宪法",
    "民商法"
]);
a.getAnswer()
```

__运行结果：Array(3)： [2, 1, 3]__

## 四（题目包含答案）：
```javascript
var a = new AnswerUtil('法律部门都有宪法，刑法，民商法', ["国际法","诉讼法","经济法"], [
    "行政法",
    "刑法",
    "宪法",
    "民商法"
]);
a.getAnswer()
```

__运行结果：Array(3)： [2, 1, 3]__

## 五（无匹配答案）：
```javascript
var a = new AnswerUtil('', ["1","2","3"], [
    "行政法",
    "刑法",
    "宪法",
    "民商法"
]);
a.getAnswer()
```

__运行结果：Array(0)： []__

## 思路

 * 第一
 * 1。先做全等判断：
 * 2。去掉句号，逗号，空格，回车，等特殊字符再判断
 * 3。去除除了中文，数字，日文，韩文，英文字符，再判断
 * 
 * 第二
 * 1。模糊判断
 * 2。去掉句号，逗号，空格，回车，等特殊字符再模糊判断
 * 3。去除除了中文，数字，日文，韩文，英文字符，再模糊判断
 * 4。字符串每个字符进行对比，判断相似度
 * 5。从题目当中判断是否包含答案，模糊判断
 * 
 * 第三（特殊情况）
 * 1。直接给答案
 * 2。判断题
