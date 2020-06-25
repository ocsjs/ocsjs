 

/**
 * 思路：
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
 * 
 */


/**
 * @description  AnswerUtil —— 答题工具类，传入3个参数，经过处理可得出较为正确的答案
 * @param {*} question 问题
 * @param {*} answer 回答
 * @param {*} type 题目类型
 * @param {*} options 全部选项
 */

function AnswerUtil(question, answers, options) {
    var obj = new Object();

    //特殊字符正则表达式
    var char = /\s/g;
    //除了中文，数字，日文，韩文，英文字符之外的字符的正则表达式
    var normal_char = /[^\u2E80-\u2FDF\u3040-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7FF0-9a-zA-Z①②③④⑤⑥⑦⑧√×]/
    //数字的正则表达式
    var num_regexp = /[^0-9]/g;
    //正确正则表达式
    var right_regexp = /(^|,)(正确|是|对|√|T|ri)(,|$)/;
    //错误正则表达式
    var wrong_regexp = /(^|,)(错误|否|错|×|F|wr)(,|$)/;

    var answer = new Array();
    answer = answer.concat(answers);
    var option = new Array();
    option = option.concat(options);

    //数组全部元素替换
    Array.prototype.replace = function (regexp, key) {
        for (let i = 0; i < this.length; i++) {
            this[i] = this[i].replace(regexp, key);
        }
        return this;
    };


    obj.step = 0;//执行步数
    obj.result = new Array();//结果

    //单选题
    obj.init = function (question, answer, option) {

        if (
            //直接给出abc选项，那么转换成数字索引即可
            //obj.transformABC(answer.replace(normal_char, ''))
            //是否为判断题
            obj.isT_or_F(answer, option)//是否为判断题
            || obj.isT_or_F(answer.replace(char, ''), option.replace(char, ''))//去除特殊字符再，判断题
            || obj.isT_or_F(answer.replace(normal_char, ''), option.replace(normal_char, ''))//去除特殊字符再，判断题
            //以下是全等判断
            || obj.isInArray(answer, option)//全等判断：
            || obj.isInArray(answer.replace(char, ''), option.replace(char, ''))//去掉句号，逗号，空格，回车，等特殊字符再判断
            || obj.isInArray(answer.replace(normal_char, ''), option.replace(normal_char, ''))//去除除了中文，数字，日文，韩文，英文字符，再判断
            //以下是模糊判断
            || obj.isIndexOF_InArray(answer, option)//模糊判断
            || obj.isIndexOF_InArray(answer.replace(char, ''), option.replace(char, ''))//去掉句号，逗号，空格，回车，等特殊字符再模糊判断
            || obj.isIndexOF_InArray(answer.replace(normal_char, ''), option.replace(normal_char, ''))//去除除了中文，数字，日文，韩文，英文字符，再模糊判断
            //以下是对题目的判断
            || obj.isIndexOF_InArray([question], option,'question')//模糊判断
            || obj.isIndexOF_InArray([question].replace(char, ''), option.replace(char, ''),'question')//去掉句号，逗号，空格，回车，等特殊字符再模糊判断
            || obj.isIndexOF_InArray([question].replace(normal_char, ''), option.replace(normal_char, ''),'question')//去除除了中文，数字，日文，韩文，英文字符，再模糊判断
            || obj.isSame([question], option)//从题目当中判断是否包含答案，模糊判断
            || obj.isSame(answer, option)//字符串每个字符进行对比，判断相似度
        ) {
            obj.norepeat(obj.result)//数组去重
        }
    }

    //对错判断
    obj.isT_or_F = function (array, opt) {
        //如果答案匹配，正确
        obj.step++;
        let result = new Array();
        try {
            if (array[0].match(right_regexp)) {
                //如果第一个选项匹配:正确，则第一个就是答案
                if (opt[0].match(right_regexp)) result.push(0);
                else if (opt[1].match(right_regexp)) result.push(1);
            }
            //如果答案匹配，错误
            else if (array[0].match(wrong_regexp)) {
                //如果第一个选项匹配:错误，则第一个就是答案
                if (opt[0].match(wrong_regexp)) result.push(0);
                else if (opt[1].match(wrong_regexp)) result.push(1);
            }
        } catch (e) {
            console.log(e);
        }

        return obj.save(result);
    }

    //元素是否在数组中，如果是，返回元素在数组中的下标
    obj.isInArray = function (array, opt) {
        obj.step++;
        let result = new Array();
        try {
            //for循环判断
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < opt.length; j++) {
                    if (opt[j] != '' && array[i] != '') {
                        if (opt[j] == array[i]) {
                            result.push(j);
                            array[i]='';
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
        return obj.save(result);
    }

    //是否包含其中某个字符串
    obj.isIndexOF_InArray = function (array, opt,type) {
        obj.step++;
        let result = new Array();
        //for循环判断
        try {
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < opt.length; j++) {
                    //哪个字符串长，就用那个字符串去index找 字符串长度小的字符串。
                    if (opt[j] != '' && array[i] != '') {
                        if (opt[j].length > array[i].length ? opt[j].indexOf(array[i]) != -1 : array[i].indexOf(opt[j]) != -1) {
                            result.push(j);
                            //如果包含，则删除对应答案，避免下次匹配重新配对
                            if(type!='question')array[i]='';
                            //如果类型是，题目中包含答案，那么就删除答案中的字符
                            else array[0].replace(opt[j],'');
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }

        return obj.save(result);
    }


    /**
     * 字符串相似判断，原理：
     * 
     * 比如有4个选项，3个答案，那么我就先对第一个选项，依次和每个答案判断3次，
     * 然后使用getSameRate，获得每次2个字符串的相同次数，例如：
     * 答案1：相同字数，10个字
     * 答案2：相同字数，12个字
     * 答案3，相同字数，6个字
     * 
     * 那么答案毫无疑问，就选第二个答案。
     * 然后吧第二个答案储存到数组中
     * 
     * 
     */

    obj.isSame = function (array, opt) {
        obj.step++;
        let result = new Array();
        let answer = array;
        try {
            for (let i = 0; i < array.length; i++) {
                let rate = new Array();
                for (let j = 0; j < opt.length; j++) {
                    //获取2个字符的相似度
                    rate.push(obj.getSameRate(answer[i], opt[j]));
                }
                //如果有相似的，那么取相似度最高那个
                let max = 0;
                let index = -1;
                for (let i = 0; i < rate.length; i++) {

                    if (rate[i] > max && rate[i] >= (0.6 * opt[i].length).toFixed(0)) {//循环找出最大比值
                        max = rate[i];
                        //如果是最大的相似度，并且
                        index = i;

                    }
                }
                // //保存索引
                if (index != -1){
                    result.push(index);
                    answer[i]='';
                }


            }
        } catch (e) {
            console.log(e);
        }
        return obj.save(result);
    }


    //ABC..转换为123...
    obj.transformABC = function (abcABC_str) {
        //根据字母下标，转换
        obj.step++;
        let str = abcABC_str.replace(char, '');
        let ABC_str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let abc_str = "abcdefghijklmnopqrstuvwxyz";
        let result = new Array();

        try {
            //必须匹配全是英文的答案，并且匹配结果的数量跟原字符串长度必须一样，例如ABC，匹配A,B,C 。如果是“回答是ABC”，匹配A，B，C，，原字符串长度为9，这样是不行的
            if (str[0].match(/[a-zA-Z]/g) != null && str[0].match(/[a-zA-Z]/g).length == str[0].length) {
                let abc_array = str[0].replace(/[^a-zA-Z]/g, '').split('');
                for (let i in abc_array) {
                    if (ABC_str.indexOf(abc_array[i]) != -1) result.push(ABC_str.indexOf(abc_array[i]));
                    else if (abc_str.indexOf(abc_array[i]) != -1) result.push(abc_str.indexOf(abc_array[i]));
                }
            }

        } catch (e) {
            console.error(e);
        }
        return obj.save(result);
    }

    //保存数据，如存在数据则true，不存在数据则false
    obj.save = function (result_array) {
        if (result_array.length != 0) {
            obj.result = result_array;
            return true;
        } else return false;
    }

    //获取2个字符串的相同字数
    obj.getSameRate = function (str1, str2) {

        try {

            let array1 = str1.split('');
            let array2 = str2.split('');
            let result = -1;
            for (let i = 0; i < array1.length; i++) {
                for (let j = 0; j < array2.length; j++) {
                    if (array1[i] == array2[j]) {
                        result++;
                        break;
                    }
                }
            }
            return result == -1 ? result : ++result;
        } catch (e) {
            console.log(e);
            return -1;
        }

    }

    //数组去重
    obj.norepeat=function(arr){
        for(var i = 0;i<arr.length-1;i++){            
            for(var j = i+1;j<arr.length;j++){
                if(arr[i]==arr[j]){
                    arr.splice(j,1);
                    j--;
                }
            }
        }
        return arr;
    }

    obj.init(question, answer, option);

    obj.getAnswer = function () {
        return obj.norepeat(obj.result);
    }



    return obj;
}



