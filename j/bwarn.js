var browserWarnMessage = function(options){
    
    /*
     * http://www.useragentstring.com/pages/useragentstring.php - USER AGENT LIST:
     *
     * http://www.useragentstring.com/pages/Chrome/
     * http://www.useragentstring.com/pages/Firefox/
     * http://www.useragentstring.com/pages/Opera/
     * http://www.useragentstring.com/pages/Safari/
     * http://www.useragentstring.com/pages/Internet%20Explorer/
     */
    
    var browserWarnLoader = {
        init: function(options){
            (browserChecker.browserIsOld(navigator.userAgent, options) && bwarnModalWindow.readCookie() != 1) && bwarnModalWindow.showWarning();
        }
    }
    
    var browserChecker = {
        
        browserIsOld: function(s, o){
            
            var b = this.browserType(s), v, av;
            
            if(b === "Chrome"){
                v = this.getChromeVersion(s);
                av = o.targetVersions.chrome;
            } else if(b === "Firefox"){
                v = this.getFFVersion(s);
                av = o.targetVersions.firefox;
            } else if(b === "Opera"){
                v = this.getOperaVersion(s);
                av = o.targetVersions.opera;
            } else if(b === "Safari"){
                v = this.getSafariVersion(s);
                av = o.targetVersions.safari;
            } else if(b === "IE"){
                v = this.getIEVersion(s);
                av = o.targetVersions.ie;
            } else{
                v = null;
            }
            
            v = (b !== null || v !== null) ? this.filterVersion(v) : v;
            av = (b !== null || v !== null) ? this.filterVersion(av) : av;
            
            return ( parseFloat(v) <= parseFloat(av) ) ? true : false;
            
        },
        
        filterVersion: function(v){
            var i = 0;
            var nv = v.replace(/[.a-zA-Z_]/g, function() {
                return i++ === 0 ? '.' : ''; 
            });
            return nv;
        },
        
        browserType: function(s){
            if(/Chrome\/[a-zA-Z0-9.]*/.test(s)){
                return "Chrome";
            } else if(/(Gecko\/[0-9]+.*?)?Firefox[\/|\s][a-zA-Z0-9.]*/.test(s)){
                return "Firefox";
            } else if(/Opera[\/|\s][a-zA-Z0-9.]+/.test(s)){
                return "Opera";
            } else if(/Safari\/[a-zA-Z0-9.]*/.test(s)){
                return "Safari";
            } else if(/MSIE\s[a-zA-Z0-9.]+/.test(s)){
                return "IE";
            } else{
                return null;
            }
        },
        
        getChromeVersion: function(s){
            var v = '';
            v = s.match(/Chrome[\/|\s]([a-zA-Z0-9.]*)/);

            return v[1];
        },
        
        getFFVersion: function(s){
            var v = '';
            v = s.match(/Firefox[\/|\s]([a-zA-Z0-9.]*)/);
            
            return v[1];
        },
        
        getIEVersion: function(s){
            var v = '';
            v = s.match(/MSIE[\/|\s]([a-zA-Z0-9.]*)/);
            
            return v[1];
        },
        
        getOperaVersion: function(s){
            var v = '';
            
            if(/Version[\/|\s][a-zA-Z0-9.]*/.test(s)){
                v = s.match(/Version[\/|\s]([a-zA-Z0-9.]*)/);
            } else{
                v = s.match(/Opera[\/|\s]([a-zA-Z0-9.]*)/);
            }
            
            return v[1];
        },
        
        getSafariVersion: function(s){
            var v = '';
            
            if(/Version[\/|\s][a-zA-Z0-9.]*/.test(s)){
                v = s.match(/Version[\/|\s]([a-zA-Z0-9.]*)/);
                return v[1];
            } else{
                // Safari version 2 or 1 do not have 'Version' word in user-agent string;
                v = '2';
                return v;
            }
        }
        
    }
    
    var bwarnModalWindow = {
        
        downloadLinks : {
            opera :     'http://www.opera.com/download/',
            firefox :   'http://www.mozilla.org/ru/firefox/new/',
            ie :        'http://windows.microsoft.com/en-US/internet-explorer/products/ie/home',
            safari :    'http://www.apple.com/safari/download/',
            chrome :    'http://www.google.com/chrome'
        },
        
        options: {
            stylePath :     'c/bwarn.css',
//            headLine:       'Your browser is out of date',
            headLine:       'Hmmm... Your browser is really sucks!',
//            introText :     'For best experience, please upgrade to the latest',
            introText :     'Upgrade it to one of the following:',
            outro:          true,
            outroText :     'or [close]proceed at your own risk[/close].',
            closeBtnClass:  'bwarn_window-close'
        },
        
        showWarning: function(){

            this.addLayout();
            this.attachResizeAction();
            this.attachScrollAction();
            this.attachCloseAction();
            
        },
        
        hideWarning: function(){
            this.writeCookie();
            
            var bwarn_shadow = document.getElementById('bwarn_overlay'),
                bwarn_window = document.getElementById('bwarn_window');
            
            bwarn_shadow.style.display = 'none';
            bwarn_window.style.display = 'none';
        },
        
        addLayout: function(){
            
            this.addStyle();
            
            var
                bwarn_shadow = document.createElement('div'),
                bwarn_window = document.createElement('div'),
                size = helpers.getWindowDimensions(),
                offset = helpers.getScrollXY();
                
            bwarn_shadow.id = 'bwarn_overlay';
            bwarn_shadow.style.height = (offset.y != 0) ? offset.y + size.y + "px" : size.y + "px";
            bwarn_shadow.style.width = (offset.x != 0) ? offset.x + size.x + "px" : size.x + "px";
            bwarn_shadow.style.top = 0;
            
            bwarn_window.id = 'bwarn_window'
            bwarn_window.style.top = (offset.y != 0) ? offset.y + size.y / 2 + "px" : size.y / 2 + "px";
            bwarn_window.style.left = (offset.x != 0) ? offset.x + size.x / 2 + "px" : size.x / 2 + "px";
            
            document.body.appendChild(bwarn_shadow);
            document.body.appendChild(bwarn_window);
            
            bwarn_window = document.getElementById('bwarn_window');
            bwarn_window.innerHTML = this.insertWindowTemplate();
        },
        
        addStyle: function(){
            
            var
                style = document.createElement('link'), 
                style_href = document.createAttribute("href"), 
                style_rel = document.createAttribute("rel"),
                head = document.head || document.getElementsByTagName('head')[0];
                
            style_href.nodeValue = this.options.stylePath;
            style_rel.nodeValue = "stylesheet";
            
            style.setAttributeNode(style_rel);
            style.setAttributeNode(style_href);
            
            head.appendChild(style);
                
        },
        
        attachScrollAction: function(){
            var bwarn_shadow = document.getElementById('bwarn_overlay'),
                bwarn_window = document.getElementById('bwarn_window'),
                size = helpers.getWindowDimensions();
            
            window.onscroll = function(){
                if(bwarn_shadow.style.display != 'none' && bwarn_window.style.display != 'none'){
                    var offset = helpers.getScrollXY();
                    
                    bwarn_shadow.style.top = offset.y + "px";
                    bwarn_window.style.top = size.y / 2 + offset.y + "px";
                }
            }
        },
        
        attachResizeAction: function(){
            var bwarn_shadow = document.getElementById('bwarn_overlay'),
                bwarn_window = document.getElementById('bwarn_window');

            window.onresize = function(){
                if(bwarn_shadow.style.display != 'none' && bwarn_window.style.display != 'none'){
                    var size = helpers.getWindowDimensions(),
                        offset = helpers.getScrollXY();

                    bwarn_shadow.style.height = size.y + "px";
                    bwarn_shadow.style.width = size.x + "px";

                    bwarn_window.style.top = size.y / 2 + offset.y + "px";
                    bwarn_window.style.left = size.x / 2 + "px";
                }
            }
        },
        
        attachCloseAction: function(){
            
            var bwarn_shadow = document.getElementById('bwarn_overlay'),
                bwarn_window = document.getElementById('bwarn_window'),
                _this = this;
            
            bwarn_shadow.onclick = function(){
                _this.hideWarning();
            }
            
            var closeButtons = helpers.getElementByClassName(this.options.closeBtnClass, bwarn_window);
  
            for(var i in closeButtons){
                closeButtons[i].onclick = function(e){
                    e.preventDefault();
                    _this.hideWarning();
                }
            }
        },

        insertWindowTemplate: function(){
            
            var outroText = '';
            
            if(this.options.outro === true){
                outroText = "<p class='outro'>"+this.options.outroText+"</p>";
                outroText = outroText.replace(/(\[close\])/, "<a class='"+this.options.closeBtnClass+"' href='javascript:void(0);'>");
                outroText = outroText.replace(/(\[\/close\])/, "</a>");  
            }
            
            var tpl = 
                "<a class='"+this.options.closeBtnClass+" close-x' href='javascript:void(0);'></a>"+
                "<h1>"+this.options.headLine+"</h1>"+
                "<p class='intro'>"+this.options.introText+"</p>"+
                "<table>"+
                    "<tr>"+
                        "<td><a style='background-position:2px 0' href='"+this.downloadLinks.firefox+"'>Firefox</a></td>"+
                        "<td><a style='background-position:-106px 0' href='"+this.downloadLinks.chrome+"'>Chrome</a></td>"+
                        "<td><a style='background-position:-429px 0' href='"+this.downloadLinks.safari+"'>Safari</a></td>"+
                        "<td><a style='background-position:-317px 0' href='"+this.downloadLinks.opera+"'>Opera</a></td>"+
                        "<td><a style='background-position:-207px 0' href='"+this.downloadLinks.ie+"'>Internet Explorer</a></td>"+
                    "</tr>"+
                "</table>"+
                
                outroText;
            
            return tpl;
            
        },
        
        writeCookie: function(period){
            var 
                date = new Date(), 
                gmt = new Date();
            switch (period) {
                case 'day':
                    period = 24;
                    break;
                case 'week':
                    period = 24*7;
                    break;
                case 'month':
                    period = 24*30;
                    break;
                case 'year':
                    period = 24*365;
                    break;
                default:
                    period = 24;
                    break;
            }
            date = date.getTime() + period * 3600 * 1000;
            gmt.setTime(date);
            gmt.toGMTString();
        
            document.cookie="bwarnSkip=1;path=/;expires="+gmt;
        },
    
        readCookie: function(){
            if(document.cookie.indexOf('bwarnSkip') == -1){
                return 0;
            } else{
                return document.cookie.match(/bwarnSkip\=(\d)/)[1];
            }
        }
        
    }
    
    var helpers = {
        
        getScrollXY: function(){
            var scrOfX = 0, scrOfY = 0;
            if( typeof( window.pageYOffset ) == 'number' ) {
                //Netscape compliant
                scrOfY = window.pageYOffset;
                scrOfX = window.pageXOffset;
            } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
                //DOM compliant
                scrOfY = document.body.scrollTop;
                scrOfX = document.body.scrollLeft;
            } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
                //IE6 standards compliant mode
                scrOfY = document.documentElement.scrollTop;
                scrOfX = document.documentElement.scrollLeft;
            }
            return {
                x: parseFloat(scrOfX, 0), 
                y: parseFloat(scrOfY, 0)
            };
        },
        
        getWindowDimensions: function(){
            var 
                myWidth = 0, 
                myHeight = 0;
            if( typeof( window.innerWidth ) == 'number' ) {
                //Non-IE
                myWidth = window.innerWidth;
                myHeight = window.innerHeight;
            } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                //IE 6+ in 'standards compliant mode'
                myWidth = document.documentElement.clientWidth;
                myHeight = document.documentElement.clientHeight;
            } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                //IE 4 compatible
                myWidth = document.body.clientWidth;
                myHeight = document.body.clientHeight;
            }
            
            return {
                x: parseFloat(myWidth, 0),
                y: parseFloat(myHeight, 0)
            }
        },
        
        getElementByClassName: function(cl, el){
            if(document.getElementsByClassName) {
                return (el || document).getElementsByClassName(cl)
            } else {         
                var 
                    el = el || document,
                    elms = el.getElementsByTagName('*'),
                    length = elms.length, 
                    clArr = cl.split(/\s+/),
                    classesLength = clArr.length,
                    result = [], 
                    i,
                    j;
                for(i = 0; i < length; i++) {
                    for(j = 0; j < classesLength; j++)  {
                        if(elms[i].className.search('\\b' + clArr[j] + '\\b') != -1) {
                            result.push(elms[i])
                            break
                        }
                    }
                }
                return result;
            }
        }
        
    }
    
    browserWarnLoader.init(options);
}