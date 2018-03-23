/**
 * App 通信交互
 *
 * @Creator Ryu
 * @version 1.1
 * @createTime 2018/3/21 16:13:47
 *
 * 自定义协议：scheme://web.app?{cmd:Number(Number:命令号，必填),jsonStr:String(参数，可选),callback:String(回调函数名，可选)}
 *
 */
(function() {
    var mobileCall = {
        /* 定义scheme */
        protocol: 'schemeApp://web.app',

        /* 回调函数前缀 */
        prefixCall: 'schemecall',

        /* UA标志判断 */
        isAndroid: /Android|Adr/i.test(navigator.userAgent),
        isIOS: /(iPhone|iPod|iPad)/.test(navigator.userAgent),
        isWindowsPhone: /(?:Windows Phone)/.test(navigator.userAgent),
        isSymbian: /(?:SymbianOS)/.test(navigator.userAgent),
        isUCBrowser: /UCBrowser|UCWEB/.test(navigator.userAgent),
        isPc: function() {
            var me = this;

            if (!me.isIOS && ! me.isAndroid && ! me.isSymbian) {
                me.isPc = function() {
                    return true;
                };
            } else {
                me.isPc = function() {
                    return false;
                };
            }

            return me.isPc();
        },

        /* 递增 */
        cbNum: 0,

        /* 创建iframe，用向app传参 */
        getIntentIframe: function(id) {
            var me = this,
                iframe = document.getElementById('ifr' + id);

            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'ifr' + id;
                iframe.style.cssText = 'display:none;width:0px;height:0px;';
                document.body.appendChild(iframe);
            }

            return iframe;
        },

        /* 此时相对路径已经变成绝对路径 ie7+ */
        getAbsoluteUrl : function(url) {
            var a = document.createElement('a');

            a.href = url;
            url = a.href;
            return url;
        },

        /**
         * 执行不返回数据的调用
         *
         * @method callCmd
         * @function
         * @param { Object } {cmd:Number(Number:命令号，必填),json:Object(参数，可选),callback:(函数, 可选)}
         * @return void(0)
         */
        callCmd: function(o) {
            var me = this,
                dc = document,
                cbName,
                jsonStr,
                schemel_url = me.protocol;

            /* 创建随机函数 */
            me.cbNum++;

            /* 随机生成回调函数名 */
            cbName = me.prefixCall + me.cbNum + Math.random().toString().substr(2, 9);

            if (o.callback) {
                window[cbName] = function(res) {
                    if (typeof res != 'undefined') {
                        if (o.callback) {
                            if (Object.prototype.toString.call(res) === '[object String]') {
                                try{
                                    o.callback(JSON.parse(res));
                                }catch(ex){
                                    o.callback(res);
                                }
                            } else {
                                o.callback(res);
                            }
                        }
                    } else {
                        o.callback();
                    }

                    delete window[cbName];
                };
            }

            if (!isNaN(o.cmd)) {
                schemel_url += '?';
                if (o.json && o.callback) {
                    jsonStr = JSON.stringify(o.json);
                    schemel_url += '{"cmd":' + o.cmd + ', "jsonStr":' + jsonStr + ', "callback":"' + cbName + '"}';
                } else if (o.json) {
                    jsonStr = JSON.stringify(o.json);
                    schemel_url += '{"cmd":' + o.cmd + ', "jsonStr":' + jsonStr + '}';
                } else if (o.callback) {
                    schemel_url += '{"cmd":' + o.cmd + ', "callback":"' + cbName + '"}';
                } else {
                    schemel_url += '{"cmd":' + o.cmd + '}';
                }

                /* window.location.href = schemel_url; */
                /* 通过iframe来传值避免同时传值覆盖 */
                me.getIntentIframe(o.cmd).src = schemel_url;

                return schemel_url;
            }
        },

        /**
         * 用于定义方法
         * @param callback
         */
        demoFunc: function(callback) {
            var me = this;

            return me.callCmd({
                cmd: 101,
                callback: callback
            });
        }
    };

    /* 暴露方法 */
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return mobileCall;
        });
    } else if (typeof module === 'object' && module && typeof module.exports === 'object' && module.exports) {
        module.exports = mobileCall;
    } else {
        window.mobileCall = mobileCall;
    }

})(function() {
    return this || window;
}());
