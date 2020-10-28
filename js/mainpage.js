// SpryTabbedPanels.js - version 0.6 - Spry Pre-Release 1.6.1
//
// Copyright (c) 2006. Adobe Systems Incorporated.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   * Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//   * Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//   * Neither the name of Adobe Systems Incorporated nor the names of its
//     contributors may be used to endorse or promote products derived from this
//     software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

var Spry;
if (!Spry) Spry = {};
if (!Spry.Widget) Spry.Widget = {};

Spry.Widget.TabbedPanels = function(element, opts)
{
  this.element = this.getElement(element);
  this.defaultTab = 0; // Show the first panel by default.
  this.tabSelectedClass = "TabbedPanelsTabSelected";
  this.tabHoverClass = "TabbedPanelsTabHover";
  this.tabFocusedClass = "TabbedPanelsTabFocused";
  this.panelVisibleClass = "TabbedPanelsContentVisible";
  this.focusElement = null;
  this.hasFocus = false;
  this.currentTabIndex = 0;
  this.enableKeyboardNavigation = true;
  this.nextPanelKeyCode = Spry.Widget.TabbedPanels.KEY_RIGHT;
  this.previousPanelKeyCode = Spry.Widget.TabbedPanels.KEY_LEFT;

  Spry.Widget.TabbedPanels.setOptions(this, opts);

  // If the defaultTab is expressed as a number/index, convert
  // it to an element.

  if (typeof (this.defaultTab) == "number")
  {
    if (this.defaultTab < 0)
      this.defaultTab = 0;
    else
    {
      var count = this.getTabbedPanelCount();
      if (this.defaultTab >= count)
        this.defaultTab = (count > 1) ? (count - 1) : 0;
    }

    this.defaultTab = this.getTabs()[this.defaultTab];
  }

  // The defaultTab property is supposed to be the tab element for the tab content
  // to show by default. The caller is allowed to pass in the element itself or the
  // element's id, so we need to convert the current value to an element if necessary.

  if (this.defaultTab)
    this.defaultTab = this.getElement(this.defaultTab);

  this.attachBehaviors();
};

Spry.Widget.TabbedPanels.prototype.getElement = function(ele)
{
  if (ele && typeof ele == "string")
    return document.getElementById(ele);
  return ele;
};

Spry.Widget.TabbedPanels.prototype.getElementChildren = function(element)
{
  var children = [];
  var child = element.firstChild;
  while (child)
  {
    if (child.nodeType == 1 /* Node.ELEMENT_NODE */)
      children.push(child);
    child = child.nextSibling;
  }
  return children;
};

Spry.Widget.TabbedPanels.prototype.addClassName = function(ele, className)
{
  if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) != -1))
    return;
  ele.className += (ele.className ? " " : "") + className;
};

Spry.Widget.TabbedPanels.prototype.removeClassName = function(ele, className)
{
  if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) == -1))
    return;
  ele.className = ele.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");
};

Spry.Widget.TabbedPanels.setOptions = function(obj, optionsObj, ignoreUndefinedProps)
{
  if (!optionsObj)
    return;
  for (var optionName in optionsObj)
  {
    if (ignoreUndefinedProps && optionsObj[optionName] == undefined)
      continue;
    obj[optionName] = optionsObj[optionName];
  }
};

Spry.Widget.TabbedPanels.prototype.getTabGroup = function()
{
  if (this.element)
  {
    var children = this.getElementChildren(this.element);
    if (children.length)
      return children[0];
  }
  return null;
};

Spry.Widget.TabbedPanels.prototype.getTabs = function()
{
  var tabs = [];
  var tg = this.getTabGroup();
  if (tg)
    tabs = this.getElementChildren(tg);
  return tabs;
};

Spry.Widget.TabbedPanels.prototype.getContentPanelGroup = function()
{
  if (this.element)
  {
    var children = this.getElementChildren(this.element);
    if (children.length > 1)
      return children[1];
  }
  return null;
};

Spry.Widget.TabbedPanels.prototype.getContentPanels = function()
{
  var panels = [];
  var pg = this.getContentPanelGroup();
  if (pg)
    panels = this.getElementChildren(pg);
  return panels;
};

Spry.Widget.TabbedPanels.prototype.getIndex = function(ele, arr)
{
  ele = this.getElement(ele);
  if (ele && arr && arr.length)
  {
    for (var i = 0; i < arr.length; i++)
    {
      if (ele == arr[i])
        return i;
    }
  }
  return -1;
};

Spry.Widget.TabbedPanels.prototype.getTabIndex = function(ele)
{
  var i = this.getIndex(ele, this.getTabs());
  if (i < 0)
    i = this.getIndex(ele, this.getContentPanels());
  return i;
};

Spry.Widget.TabbedPanels.prototype.getCurrentTabIndex = function()
{
  return this.currentTabIndex;
};

Spry.Widget.TabbedPanels.prototype.getTabbedPanelCount = function(ele)
{
  return Math.min(this.getTabs().length, this.getContentPanels().length);
};

Spry.Widget.TabbedPanels.addEventListener = function(element, eventType, handler, capture)
{
  try
  {
    if (element.addEventListener)
      element.addEventListener(eventType, handler, capture);
    else if (element.attachEvent)
      element.attachEvent("on" + eventType, handler);
  }
  catch (e) {}
};

Spry.Widget.TabbedPanels.prototype.cancelEvent = function(e)
{
  if (e.preventDefault) e.preventDefault();
  else e.returnValue = false;
  if (e.stopPropagation) e.stopPropagation();
  else e.cancelBubble = true;

  return false;
};

Spry.Widget.TabbedPanels.prototype.onTabClick = function(e, tab)
{
  this.showPanel(tab);
  return this.cancelEvent(e);
};

Spry.Widget.TabbedPanels.prototype.onTabMouseOver = function(e, tab)
{
  this.addClassName(tab, this.tabHoverClass);
  return false;
};

Spry.Widget.TabbedPanels.prototype.onTabMouseOut = function(e, tab)
{
  this.removeClassName(tab, this.tabHoverClass);
  return false;
};

Spry.Widget.TabbedPanels.prototype.onTabFocus = function(e, tab)
{
  this.hasFocus = true;
  this.addClassName(tab, this.tabFocusedClass);
  return false;
};

Spry.Widget.TabbedPanels.prototype.onTabBlur = function(e, tab)
{
  this.hasFocus = false;
  this.removeClassName(tab, this.tabFocusedClass);
  return false;
};

Spry.Widget.TabbedPanels.KEY_UP = 38;
Spry.Widget.TabbedPanels.KEY_DOWN = 40;
Spry.Widget.TabbedPanels.KEY_LEFT = 37;
Spry.Widget.TabbedPanels.KEY_RIGHT = 39;



Spry.Widget.TabbedPanels.prototype.onTabKeyDown = function(e, tab)
{
  var key = e.keyCode;
  if (!this.hasFocus || (key != this.previousPanelKeyCode && key != this.nextPanelKeyCode))
    return true;

  var tabs = this.getTabs();
  for (var i =0; i < tabs.length; i++)
    if (tabs[i] == tab)
    {
      var el = false;
      if (key == this.previousPanelKeyCode && i > 0)
        el = tabs[i-1];
      else if (key == this.nextPanelKeyCode && i < tabs.length-1)
        el = tabs[i+1];

      if (el)
      {
        this.showPanel(el);
        el.focus();
        break;
      }
    }

  return this.cancelEvent(e);
};

Spry.Widget.TabbedPanels.prototype.preorderTraversal = function(root, func)
{
  var stopTraversal = false;
  if (root)
  {
    stopTraversal = func(root);
    if (root.hasChildNodes())
    {
      var child = root.firstChild;
      while (!stopTraversal && child)
      {
        stopTraversal = this.preorderTraversal(child, func);
        try { child = child.nextSibling; } catch (e) { child = null; }
      }
    }
  }
  return stopTraversal;
};

Spry.Widget.TabbedPanels.prototype.addPanelEventListeners = function(tab, panel)
{
  var self = this;
  Spry.Widget.TabbedPanels.addEventListener(tab, "click", function(e) { return self.onTabClick(e, tab); }, false);
  Spry.Widget.TabbedPanels.addEventListener(tab, "mouseover", function(e) { return self.onTabMouseOver(e, tab); }, false);
  Spry.Widget.TabbedPanels.addEventListener(tab, "mouseout", function(e) { return self.onTabMouseOut(e, tab); }, false);

  if (this.enableKeyboardNavigation)
  {
    // XXX: IE doesn't allow the setting of tabindex dynamically. This means we can't
    // rely on adding the tabindex attribute if it is missing to enable keyboard navigation
    // by default.

    // Find the first element within the tab container that has a tabindex or the first
    // anchor tag.

    var tabIndexEle = null;
    var tabAnchorEle = null;

    this.preorderTraversal(tab, function(node) {
      if (node.nodeType == 1 /* NODE.ELEMENT_NODE */)
      {
        var tabIndexAttr = tab.attributes.getNamedItem("tabindex");
        if (tabIndexAttr)
        {
          tabIndexEle = node;
          return true;
        }
        if (!tabAnchorEle && node.nodeName.toLowerCase() == "a")
          tabAnchorEle = node;
      }
      return false;
    });

    if (tabIndexEle)
      this.focusElement = tabIndexEle;
    else if (tabAnchorEle)
      this.focusElement = tabAnchorEle;

    if (this.focusElement)
    {
      Spry.Widget.TabbedPanels.addEventListener(this.focusElement, "focus", function(e) { return self.onTabFocus(e, tab); }, false);
      Spry.Widget.TabbedPanels.addEventListener(this.focusElement, "blur", function(e) { return self.onTabBlur(e, tab); }, false);
      Spry.Widget.TabbedPanels.addEventListener(this.focusElement, "keydown", function(e) { return self.onTabKeyDown(e, tab); }, false);
    }
  }
};

Spry.Widget.TabbedPanels.prototype.showPanel = function(elementOrIndex)
{
  var tpIndex = -1;

  if (typeof elementOrIndex == "number")
    tpIndex = elementOrIndex;
  else // Must be the element for the tab or content panel.
    tpIndex = this.getTabIndex(elementOrIndex);

  if (!tpIndex < 0 || tpIndex >= this.getTabbedPanelCount())
    return;

  var tabs = this.getTabs();
  var panels = this.getContentPanels();

  var numTabbedPanels = Math.max(tabs.length, panels.length);

  for (var i = 0; i < numTabbedPanels; i++)
  {
    if (i != tpIndex)
    {
      if (tabs[i])
        this.removeClassName(tabs[i], this.tabSelectedClass);
      if (panels[i])
      {
        this.removeClassName(panels[i], this.panelVisibleClass);
        panels[i].style.display = "none";
      }
    }
  }

  this.addClassName(tabs[tpIndex], this.tabSelectedClass);
  this.addClassName(panels[tpIndex], this.panelVisibleClass);
  panels[tpIndex].style.display = "block";

  this.currentTabIndex = tpIndex;
};

Spry.Widget.TabbedPanels.prototype.attachBehaviors = function(element)
{
  var tabs = this.getTabs();
  var panels = this.getContentPanels();
  var panelCount = this.getTabbedPanelCount();

  for (var i = 0; i < panelCount; i++)
    this.addPanelEventListeners(tabs[i], panels[i]);

  this.showPanel(this.defaultTab);
};

//** jQuery Scroll to Top Control script- (c) Dynamic Drive DHTML code library: http://www.dynamicdrive.com.
//** Available/ usage terms at http://www.dynamicdrive.com (March 30th, 09')
//** v1.1 (April 7th, 09'):
//** 1) Adds ability to scroll to an absolute position (from top of page) or specific element on the page instead.
//** 2) Fixes scroll animation not working in Opera.


var scrolltotop={
  //startline: Integer. Number of pixels from top of doc scrollbar is scrolled before showing control
  //scrollto: Keyword (Integer, or "Scroll_to_Element_ID"). How far to scroll document up when control is clicked on (0=top).
  setting: {startline:50, scrollto: 0, scrollduration:1000, fadeduration:[1000, 100]},
  controlHTML: '<img src="../imgs/up.png" style="width:52px; height:53px" />', //HTML for control, which is auto wrapped in DIV w/ ID="topcontrol"
  controlattrs: {offsetx:8, offsety:40}, //offset of control relative to right/ bottom of window corner
  anchorkeyword: '#top', //Enter href value of HTML anchors on the page that should also act as "Scroll Up" links

  state: {isvisible:false, shouldvisible:false},

  scrollup:function(){
    if (!this.cssfixedsupport) //if control is positioned using JavaScript
      this.$control.css({opacity:0}) //hide control immediately after clicking it
    var dest=isNaN(this.setting.scrollto)? this.setting.scrollto : parseInt(this.setting.scrollto)
    if (typeof dest=="string" && jQuery('#'+dest).length==1) //check element set by string exists
      dest=jQuery('#'+dest).offset().top
    else
      dest=0
    this.$body.animate({scrollTop: dest}, this.setting.scrollduration);
  },

  keepfixed:function(){
    var $window=jQuery(window)
    var controlx=$window.scrollLeft() + $window.width() - this.$control.width() - this.controlattrs.offsetx
    var controly=$window.scrollTop() + $window.height() - this.$control.height() - this.controlattrs.offsety
    this.$control.css({left:controlx+'px', top:controly+'px'})
  },

  togglecontrol:function(){
    var scrolltop=jQuery(window).scrollTop()
    if (!this.cssfixedsupport)
      this.keepfixed()
    this.state.shouldvisible=(scrolltop>=this.setting.startline)? true : false
    if (this.state.shouldvisible && !this.state.isvisible){
      this.$control.stop().animate({opacity:1}, this.setting.fadeduration[0])
      this.state.isvisible=true
    }
    else if (this.state.shouldvisible==false && this.state.isvisible){
      this.$control.stop().animate({opacity:0}, this.setting.fadeduration[1])
      this.state.isvisible=false
    }
  },

  init:function(){
    jQuery(document).ready(function($){
      var mainobj=scrolltotop
      var iebrws=document.all
      mainobj.cssfixedsupport=!iebrws || iebrws && document.compatMode=="CSS1Compat" && window.XMLHttpRequest //not IE or IE7+ browsers in standards mode
      mainobj.$body=(window.opera)? (document.compatMode=="CSS1Compat"? $('html') : $('body')) : $('html,body')
      mainobj.$control=$('<div id="topcontrol">'+mainobj.controlHTML+'</div>')
        .css({position:mainobj.cssfixedsupport? 'fixed' : 'absolute', bottom:mainobj.controlattrs.offsety, right:mainobj.controlattrs.offsetx, opacity:0, cursor:'pointer'})
        .attr({title:'Scroll Back to Top'})
        .click(function(){mainobj.scrollup(); return false})
        .appendTo('body')
      if (document.all && !window.XMLHttpRequest && mainobj.$control.text()!='') //loose check for IE6 and below, plus whether control contains any text
        mainobj.$control.css({width:mainobj.$control.width()}) //IE6- seems to require an explicit width on a DIV containing text
      mainobj.togglecontrol()
      $('a[href="' + mainobj.anchorkeyword +'"]').click(function(){
        mainobj.scrollup()
        return false
      })
      $(window).bind('scroll resize', function(e){
        mainobj.togglecontrol()
      })
    })
  }
}

scrolltotop.init()

$(function() {
$('#tip1 a').tooltip({
  track: true,
  delay: 0,
  showURL: false,
  showBody: " - ",
  fade: 250
});
});
  $(document).ready(function(){
    $("#animar1").click(function(){
      $("#bloco1").animate( { opacity:0}, 200 )
         .animate( { width:"90%" } , 400 )
     .animate( { fontSize:"12px" } , 600 )
     .animate( { opacity:1 } , 1000 )
         .animate( { borderLeftWidth:"15px" }, 1200);
    });
    $("#animar2").click(function(){
      $("#bloco2").animate( { opacity:0}, 200 )
         .animate( { width:"90%" } , 400 )
     .animate( { fontSize:"12px" } , 600 )
     .animate( { opacity:1 } , 1000 )
         .animate( { borderRightWidth:"15px" }, 1200);
    });
   $("#animar3").click(function(){
      $("#bloco3").animate( { opacity:0}, 200 )
         .animate( { width:"90%" } , 400 )
     .animate( { fontSize:"12px" } , 600 )
     .animate( { opacity:1 } , 1000 )
         .animate( { borderRightWidth:"15px" }, 1200);
    });
   $("#animar4").click(function(){
      $("#bloco4").animate( { opacity:0}, 200 )
         .animate( { width:"90%" } , 400 )
     .animate( { fontSize:"12px" } , 600 )
     .animate( { opacity:1 } , 1000 )
         .animate( { borderRightWidth:"15px" }, 1200);
    });
   $("#animar5").click(function(){
      $("#bloco5").animate( { opacity:0}, 200 )
         .animate( { width:"90%" } , 400 )
     .animate( { fontSize:"12px" } , 600 )
     .animate( { opacity:1 } , 1000 )
         .animate( { borderRightWidth:"15px" }, 1200);
    });
   $("#animar6").click(function(){
      $("#bloco6").animate( { opacity:0}, 200 )
         .animate( { width:"90%" } , 400 )
     .animate( { fontSize:"12px" } , 600 )
     .animate( { opacity:1 } , 1000 )
         .animate( { borderRightWidth:"15px" }, 1200);
    });
  $("#esconder1").click(function(){
      $("#bloco1").animate( { opacity:0}, 1000 )
     .animate( { fontSize:"0px" } , 1000 )
     .animate( { borderLeftWidth:"0px" } , 1000 );
    });
  $("#esconder2").click(function(){
      $("#bloco2").animate( { opacity:0}, 1000 )
     .animate( { fontSize:"0px" } , 1000 )
     .animate( { borderRightWidth:"0px" } , 1000 );
    });
  $("#esconder3").click(function(){
      $("#bloco3").animate( { opacity:0}, 1000 )
     .animate( { fontSize:"0px" } , 1000 )
     .animate( { borderRightWidth:"0px" } , 1000 );
    });
  $("#esconder4").click(function(){
      $("#bloco4").animate( { opacity:0}, 1000 )
     .animate( { fontSize:"0px" } , 1000 )
     .animate( { borderRightWidth:"0px" } , 1000 );
    });
  $("#esconder5").click(function(){
      $("#bloco5").animate( { opacity:0}, 1000 )
     .animate( { fontSize:"0px" } , 1000 )
     .animate( { borderRightWidth:"0px" } , 1000 );
    });
  $("#esconder6").click(function(){
      $("#bloco6").animate( { opacity:0}, 1000 )
     .animate( { fontSize:"0px" } , 1000 )
     .animate( { borderRightWidth:"0px" } , 1000 );
    });
});

  function MM_openBrWindow(theURL,winName,features) { //v2.0
  window.open(theURL,winName,features);
}