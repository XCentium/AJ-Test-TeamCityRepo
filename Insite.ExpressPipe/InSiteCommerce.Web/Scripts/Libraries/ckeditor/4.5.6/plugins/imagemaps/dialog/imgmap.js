/**
 *	Image Map Editor (imgmap) - in-browser imagemap editor
 *	Copyright (C) 2006 - 2008 Adam Maschek (adam.maschek @ gmail.com)
 *
 *	This program is free software; you can redistribute it and/or
 *	modify it under the terms of the GNU General Public License
 *	as published by the Free Software Foundation; either version 2
 *	of the License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program; if not, write to the Free Software
 *	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
/**
 *	@fileoverview
 *	Online Image Map Editor - main script file.
 *	This is the main script file of the Online Image Map Editor.
 *
 *	@date	26-02-2007 2:24:50
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@copyright
 *	@version 2.2
 *
 */
/*jslint browser: true, newcap: false, white: false, onevar: false, plusplus: false, eqeqeq: false, nomen: false */
/*global imgmapStrings:true, window:false, G_vmlCanvasManager:false */
/**
 *	@author	Adam Maschek
 *	@constructor
 *	@param config	The config object.
 */
function imgmap(config) {

	/** Version string of imgmap */
	this.version = "2.2";

	/** Build date of imgmap */
	this.buildDate = "2009/08/12 22:18";

	/** Sequential build number of imgmap */
	this.buildNumber = "113";

	/** Config object of the imgmap instance */
	this.config = {};

	/** Status flag to indicate current drawing mode */
	this.is_drawing = 0;

	/**	Array to hold language strings */
	this.strings   = [];

	/** Helper array for some drawing operations */
	this.memory    = [];

	/**	Array to hold reference to all areas (canvases) */
	this.areas     = [];

	/**	Associative array to hold bound event handlers */
	this.eventHandlers  = {};

	this.currentid = 0;
	this.draggedId  = null;
	this.selectedId = null;
	this.nextShape = 'rect';

	this.isLoaded   = false;

	/**	holds the name of the actively edited map, use getMapName to read it */
	this.mapname    = '';

	/**	holds the id of the actively edited map, use getMapIdto read it */
	this.mapid      = '';

	/** global scale of areas (1-normal, 2-doubled, 0.5-half, etc.) */
	this.globalscale = 1;

	/** is_drawing draw mode constant */
	this.DM_RECTANGLE_DRAW          = 1;
	/** is_drawing draw mode constant */
	this.DM_RECTANGLE_MOVE          = 11;
	/** is_drawing draw mode constant */
	this.DM_RECTANGLE_RESIZE_TOP    = 12;
	/** is_drawing draw mode constant */
	this.DM_RECTANGLE_RESIZE_RIGHT  = 13;
	/** is_drawing draw mode constant */
	this.DM_RECTANGLE_RESIZE_BOTTOM = 14;
	/** is_drawing draw mode constant */
	this.DM_RECTANGLE_RESIZE_LEFT   = 15;

	/** is_drawing draw mode constant */
	this.DM_SQUARE_DRAW             = 2;
	/** is_drawing draw mode constant */
	this.DM_SQUARE_MOVE             = 21;
	/** is_drawing draw mode constant */
	this.DM_SQUARE_RESIZE_TOP       = 22;
	/** is_drawing draw mode constant */
	this.DM_SQUARE_RESIZE_RIGHT     = 23;
	/** is_drawing draw mode constant */
	this.DM_SQUARE_RESIZE_BOTTOM    = 24;
	/** is_drawing draw mode constant */
	this.DM_SQUARE_RESIZE_LEFT      = 25;

	/** is_drawing draw mode constant */
	this.DM_POLYGON_DRAW            = 3;
	/** is_drawing draw mode constant */
	this.DM_POLYGON_LASTDRAW        = 30;
	/** is_drawing draw mode constant */
	this.DM_POLYGON_MOVE            = 31;

	//set some config defaults below

	/**
	 *	Mode of operation
	 *	possible values:
	 *	editor - classical editor,
	 *	editor2 - dreamweaver style editor,
	 *	highlighter - map highlighter, will spawn imgmap instances for each map found in the current page
	 *	highlighter_spawn - internal mode after spawning imgmap objects
	 */
	this.config.mode     = "editor";

	this.config.baseroot    = '';
	this.config.lang        = '';
	this.config.defaultLang = 'en';
	this.config.loglevel    = 0;
	this.config.custom_callbacks = {};//possible values: see below!

	/**	Callback events that you can handle in your GUI. */
	this.event_types        = [
		'onModeChanged',
		'onAddArea',
		'onRemoveArea',
		'onDrawArea',
		'onResizeArea',
		'onRelaxArea',
		'onFocusArea',
		'onBlurArea',
		'onMoveArea',
		'onSelectRow',
		'onLoadImage',
		'onSetMap',
		'onGetMap',
		'onSelectArea',
		'onDblClickArea',
		'onStatusMessage',
		'onAreaChanged'];

	//default color values
	this.config.CL_DRAW_SHAPE      = '#d00';
	this.config.CL_DRAW_BG         = '#fff';

	this.config.CL_NORM_SHAPE      = '#d00';
	this.config.CL_NORM_BG         = '#fff';

	this.config.CL_HIGHLIGHT_SHAPE = '#d00';
	this.config.CL_HIGHLIGHT_BG    = '#fff';
	this.config.CL_KNOB            = '#555';

	this.config.bounding_box       = true;
	this.config.label              = '%n';
	//the format string of the area labels - possible values: %n - number, %c - coords, %h - href, %a - alt, %t - title

	this.config.label_class        = 'imgmap_label';
	//the css class to apply on labels
	this.config.label_style        = 'font: bold 10px Arial';
	//the css style(s) to apply on labels

	this.config.hint               = '#%n %h';
	//the format string of the area mouseover hints - possible values: %n - number, %c - coords, %h - href, %a - alt, %t - title

	this.config.draw_opacity       = '35';
	//the opacity value of the area while drawing, moving or resizing - possible values 0 - 100 or range "(x)-y"
	this.config.norm_opacity       = '50';
	//the opacity value of the area while relaxed - possible values 0 - 100	or range "(x)-y"
	this.config.highlight_opacity  = '70';
	//the opacity value of the area while highlighted - possible values 0 - 100 or range "(x)-y"
	this.config.cursor_default     = 'crosshair';		//auto/pointer
	//the css cursor while hovering over the image

	//browser sniff
	var ua = navigator.userAgent;
	this.isMSIE    = (navigator.appName == "Microsoft Internet Explorer");
	this.isSafari  = ua.indexOf('Safari') != -1;
	this.isOpera   = (typeof window.opera != 'undefined');

	this.setup(config);
}


/**
 *	Return an object given by id or object itself.
 *	@date	22-02-2007 0:14:50
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@param	objorid	A DOM object, or id of a DOM object.
 *	@return	The identified DOM object or null on error.
 */
imgmap.prototype.assignOID = function(objorid) {
	try {
		if (typeof objorid == 'undefined') {
			this.log("Undefined object passed to assignOID.");// Called from: " + arguments.callee.caller, 1);
			return null;
		}
		else if (typeof objorid == 'object') {
			return objorid;
		}
		else if (typeof objorid == 'string') {
			return document.getElementById(objorid);
		}
	}
	catch (err) {
		this.log("Error in assignOID", 1);
	}
	return null;
};


/**
 *	Main setup function.
 *	Can be called manually or constructor will call it.
 *	@date	22-02-2007 0:15:42
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@param	config	config object
 *	@return	True if all went ok.
 */
imgmap.prototype.setup = function(config) {
	//copy non-default config parameters to this.config
	for (var i in config) {
		if (config.hasOwnProperty(i)) {
			this.config[i] = config[i];
		}
	}

	//set document event hooks
	this.addEvent(document, 'keydown',   this.eventHandlers.doc_keydown = this.doc_keydown.bind(this));
	this.addEvent(document, 'keyup',     this.eventHandlers.doc_keyup = this.doc_keyup.bind(this));
	this.addEvent(document, 'mousedown', this.eventHandlers.doc_mousedown = this.doc_mousedown.bind(this));

	//set pic_container element - supposedly it already exists in the DOM
	if (config && config.pic_container) {
		this.pic_container = this.assignOID(config.pic_container);
		this.disableSelection(this.pic_container);
	}

	//load language js - as soon as possible
	if (!this.config.lang) {
		this.config.lang = this.detectLanguage();
	}

	//check event hooks
	var found, j, le;
	for (i in this.config.custom_callbacks) {
		if (this.config.custom_callbacks.hasOwnProperty(i)) {
			found = false;
			for (j = 0, le = this.event_types.length; j < le; j++) {
				if (i == this.event_types[j]) {
					found = true;
					break;
				}
			}
			if (!found) {
				this.log("Unknown custom callback: " + i, 1);
			}
		}
	}

	//hook onload event - as late as possible
	this.addEvent(window, 'load', this.onLoad.bind(this));
	return true;
};


/**
 *	EVENT HANDLER: Handle event when the page with scripts is loaded.
 *	@date	22-02-2007 0:16:22
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@param	e	The event object.
 */
imgmap.prototype.onLoad = function(e) {
	if (this.isLoaded) {return true;}
	var _this = this;

	try {
		this.loadStrings(imgmapStrings);
	}
	catch (err) {
		this.log("Unable to load language strings", 1);
	}

	this.isLoaded = true;
	return true;
};


/**
 *	Attach new 'evt' event handler 'callback' to 'obj'
 *	@date	24-02-2007 21:16:20
 *	@param	obj	The object on which the handler is defined.
 *	@param	evt	The name of the event, like mousedown.
 *	@param	callback	The callback function (named if you want it to be removed).
 */
imgmap.prototype.addEvent = function(obj, evt, callback) {
	if (obj.attachEvent) {
		//Microsoft style registration model
		return obj.attachEvent("on" + evt, callback);
	}
	else if (obj.addEventListener) {
		//W3C style model
		obj.addEventListener(evt, callback, false);
		return true;
	}
};


/**
 *	Detach 'evt' event handled by 'callback' from 'obj' object.
 *	Callback must be a non anonymous function, see eventHandlers.
 *	@see	#eventHandlers
 *	Example: myimgmap.removeEvent(myimgmap.pic, 'mousedown', myimgmap.eventHandlers.img_mousedown);
 *	@date	24-11-2007 15:22:17
 *	@param	obj	The object on which the handler is defined.
 *	@param	evt	The name of the event, like mousedown.
 *	@param	callback	The named callback function.
 */
imgmap.prototype.removeEvent = function(obj, evt, callback) {
	if (obj.detachEvent) {
		//Microsoft style detach model
		return obj.detachEvent("on" + evt, callback);
	}
	else if (obj.removeEventListener) {
		//W3C style model
		obj.removeEventListener(evt, callback, false);
		return true;
	}
};


/**
 *	Load strings from a key:value object to the prototype strings array.
 *	@author adam
 *	@date	2007
 *	@param	obj	Javascript object that holds key:value pairs.
 */
imgmap.prototype.loadStrings = function(obj) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			this.strings[key] = obj[key];
		}
	}
};


/**
 *	This function is to load a given img url to the pic_container.
 *
 *	Loading an image will clear all current maps.
 *	@param img The imageurl or object to load (if object, function will get url, and do a recall)
 *	@param imgw The width we want to force on the image	(optional)
 *	@param imgh The height we want to force on the image (optional)
 *	@returns True on success
 */
imgmap.prototype.loadImage = function(img, imgw, imgh) {
	//test for container
	if (typeof this.pic_container == 'undefined') {
		this.log('You must have pic_container defined to use loadImage!', 2);
		return false;
	}
	//wipe all
	this.removeAllAreas();
	//reset scale
	this.globalscale = 1;

	if (typeof img == 'string') {
		//there is an image given with url to load
		if (typeof this.pic == 'undefined') {
			this.pic = document.createElement('IMG');
			this.pic_container.appendChild(this.pic);
			//event handler hooking - only at the first load
			this.addEvent(this.pic, 'mousedown', this.eventHandlers.img_mousedown = this.img_mousedown.bind(this));
			this.addEvent(this.pic, 'mouseup',   this.eventHandlers.img_mouseup = this.img_mouseup.bind(this));
			this.addEvent(this.pic, 'mousemove', this.eventHandlers.img_mousemove = this.img_mousemove.bind(this));
			this.pic.style.cursor = this.config.cursor_default;
		}

		this.pic.src = img;
		if (imgw && imgw > 0) {this.pic.setAttribute('width',  imgw);}
		if (imgh && imgh > 0) {this.pic.setAttribute('height', imgh);}
		this.fireEvent('onLoadImage', this.pic);
		return true;
	}
	else if (typeof img == 'object') {
		//we have to use the src of the image object
		var src = img.src;

		// Get the displayed dimensions of the image
		if (!imgw) {
			imgw = img.clientWidth;
		}
		if (!imgh) {
			imgh = img.clientHeight;
		}
		//recurse, this time with the url string
		return this.loadImage(src, imgw, imgh);
	}
};


/**
 *	Fires custom hook onStatusMessage, passing the status string.
 *	Use this to update your GUI.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	26-07-2008 13:22:54
 *	@param	str	The status string
 */
imgmap.prototype.statusMessage = function(str) {
	this.fireEvent('onStatusMessage', str);
};


/**
 *	Adds basic logging functionality using firebug console object if available.
 *	@date	20-02-2007 17:55:18
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@param	obj	The object or string you want to debug/echo.
 */
imgmap.prototype.log = function(obj, level) {
};


/**
 *	Get the map name of the current imagemap.
 *	If doesnt exist, nor map id, generate a new name based on timestamp.
 *	The most portable solution is to use the same value for id and name.
 *	This also conforms the HTML 5 specification, that says:
 *	"If the id  attribute is also specified, both attributes must have the same value."
 *	@link	http://www.w3.org/html/wg/html5/#the-map-element
 *	@author	adam
 *	@see	#getMapId
 *	@return The name of the map.
 */
imgmap.prototype.getMapName = function() {
	if (this.mapname === '') {
		if (this.mapid !== '') {return this.mapid;}
		var now = new Date();
		this.mapname = 'imgmap' + now.getFullYear() + (now.getMonth()+1) + now.getDate() + now.getHours() + now.getMinutes() + now.getSeconds();
	}
	return this.mapname;
};


/**
 *	Get the map id of the current imagemap.
 *	If doesnt exist, use map name.
 *	@author	adam
 *	@see	#getMapName
 *	@return	The id of the map.
 */
imgmap.prototype.getMapId = function() {
	if (this.mapid === '') {
		this.mapid = this.getMapName();
	}
	return this.mapid;
};


/**
 *	Convert wild shape names to normal ones.
 *	@date	25-12-2008 19:27:06
 *	@param	shape	The name of the shape to convert.
 *	@return	The normalized shape name, rect as default.
 */
imgmap.prototype._normShape = function(shape) {
	if (!shape) {return 'rect';}
	shape = this.trim(shape).toLowerCase();
	if (shape.substring(0, 4) == 'rect') {return 'rect';}
	if (shape.substring(0, 4) == 'circ') {return 'circle';}
	if (shape.substring(0, 4) == 'poly') {return 'poly';}
	return 'rect';
};


/**
 *	Try to normalize coordinates that came from:
 *	1. html textarea
 *	2. user input in the active area's input field
 *	3. from the html source in case of plugins or highlighter
 *	Example of inputs that need to be handled:
 *		035,035 075,062
 *		150,217, 190,257, 150,297,110,257
 *	@author	adam
 *	@param	coords	The coordinates in a string.
 *	@param	shape	The shape of the object (rect, circle, poly).
 *	@param	flag	Flags that modify the operation. (fromcircle, frompoly, fromrect, preserve)
 *	@returns The normalized coordinates.
 */
imgmap.prototype._normCoords = function(coords, shape, flag) {
	//function level var declarations
	var i;//generic cycle counter
	var sx;//smallest x
	var sy;//smallest y
	var gx;//greatest x
	var gy;//greatest y
	var temp, le;

	coords = this.trim(coords);
	if (coords === '') {return '';}
	var oldcoords = coords;
	//replace some general junk
	coords = coords.replace(/(\d)([^\d\.])+(\d)/g, "$1,$3"); // Other software might create decimal points, respect them
	coords = coords.replace(/,\D+(\d)/g, ",$1");//cut leading junk
	coords = coords.replace(/,0+(\d)/g, ",$1");//cut leading zeros
	coords = coords.replace(/(\d)(\D)+,/g, "$1,");
	coords = coords.replace(/^\D+(\d)/g, "$1");//cut leading junk
	coords = coords.replace(/^0+(\d)/g, "$1");//cut leading zeros
	coords = coords.replace(/(\d)(\D)+$/g, "$1");//cut trailing junk

	//now fix other issues
	var parts = coords.split(',');
	if (shape == 'rect') {
		if (flag == 'fromcircle') {
			var r = parts[2];
			parts[0] = parts[0] - r;
			parts[1] = parts[1] - r;
			parts[2] = parseInt(parts[0], 10) + 2 * r;
			parts[3] = parseInt(parts[1], 10) + 2 * r;
		}
		else if (flag == 'frompoly') {
			sx = parseInt(parts[0], 10); gx = parseInt(parts[0], 10);
			sy = parseInt(parts[1], 10); gy = parseInt(parts[1], 10);
			for (i=0, le = parts.length; i<le; i++) {
				if (i % 2 === 0 && parseInt(parts[i], 10) < sx) {
					sx = parseInt(parts[i], 10);}
				if (i % 2 === 1 && parseInt(parts[i], 10) < sy) {
					sy = parseInt(parts[i], 10);}
				if (i % 2 === 0 && parseInt(parts[i], 10) > gx) {
					gx = parseInt(parts[i], 10);}
				if (i % 2 === 1 && parseInt(parts[i], 10) > gy) {
					gy = parseInt(parts[i], 10);}
			}
			parts[0] = sx; parts[1] = sy;
			parts[2] = gx; parts[3] = gy;
		}
		if (!(parseInt(parts[1], 10) >= 0)) {parts[1] = parts[0];}
		if (!(parseInt(parts[2], 10) >= 0)) {parts[2] = parseInt(parts[0], 10) + 10;}
		if (!(parseInt(parts[3], 10) >= 0)) {parts[3] = parseInt(parts[1], 10) + 10;}
		if (parseInt(parts[0], 10) > parseInt(parts[2], 10)) {
			temp = parts[0];
			parts[0] = parts[2];
			parts[2] = temp;
		}
		if (parseInt(parts[1], 10) > parseInt(parts[3], 10)) {
			temp = parts[1];
			parts[1] = parts[3];
			parts[3] = temp;
		}
		coords = parts[0]+","+parts[1]+","+parts[2]+","+parts[3];
	}
	else if (shape == 'circle') {
		if (flag == 'fromrect') {
			sx = parseInt(parts[0], 10); gx = parseInt(parts[2], 10);
			sy = parseInt(parts[1], 10); gy = parseInt(parts[3], 10);
			//use smaller side
			parts[2] = (gx - sx < gy - sy) ? gx - sx : gy - sy;
			parts[2] = Math.floor(parts[2] / 2);//radius
			parts[0] = sx + parts[2];
			parts[1] = sy + parts[2];
		}
		else if (flag == 'frompoly') {
			sx = parseInt(parts[0], 10); gx = parseInt(parts[0], 10);
			sy = parseInt(parts[1], 10); gy = parseInt(parts[1], 10);
			for (i=0, le = parts.length; i<le; i++) {
				if (i % 2 === 0 && parseInt(parts[i], 10) < sx) {
					sx = parseInt(parts[i], 10);}
				if (i % 2 === 1 && parseInt(parts[i], 10) < sy) {
					sy = parseInt(parts[i], 10);}
				if (i % 2 === 0 && parseInt(parts[i], 10) > gx) {
					gx = parseInt(parts[i], 10);}
				if (i % 2 === 1 && parseInt(parts[i], 10) > gy) {
					gy = parseInt(parts[i], 10);}
			}
			//use smaller side
			parts[2] = (gx - sx < gy - sy) ? gx - sx : gy - sy;
			parts[2] = Math.floor(parts[2] / 2);//radius
			parts[0] = sx + parts[2];
			parts[1] = sy + parts[2];
		}
		if (!(parseInt(parts[1], 10) > 0)) {parts[1] = parts[0];}
		if (!(parseInt(parts[2], 10) > 0)) {parts[2] = 10;}
		coords = parts[0]+","+parts[1]+","+parts[2];
	}
	else if (shape == 'poly') {
		if (flag == 'fromrect') {
			parts[4] = parts[2];
			parts[5] = parts[3];
			parts[2] = parts[0];
			parts[6] = parts[4];
			parts[7] = parts[1];
		}
		else if (flag == 'fromcircle') {
			// @ url http://www.pixelwit.com/blog/2007/06/29/basic-circle-drawing-actionscript/
			var centerX = parseInt(parts[0], 10);
			var centerY = parseInt(parts[1], 10);
			var radius  = parseInt(parts[2], 10);
			var j = 0;
			parts[j++] = centerX + radius;
			parts[j++] = centerY;
			var sides = 60;//constant = sides the fake circle will have
			for (i=0; i<=sides; i++) {
				var pointRatio = i/sides;
				var xSteps = Math.cos(pointRatio*2*Math.PI);
				var ySteps = Math.sin(pointRatio*2*Math.PI);
				var pointX = centerX + xSteps * radius;
				var pointY = centerY + ySteps * radius;
				parts[j++] = Math.round(pointX);
				parts[j++] = Math.round(pointY);
			}
		}
		coords = parts.join(',');
	}

	if (flag == 'preserve' && oldcoords != coords) {
		//return original and throw error
		//throw "invalid coords";
		return oldcoords;
	}
	return coords;
};


/**
 *	Sets the coordinates according to the given HTML map code or DOM object.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-07 11:47:16
 *	@param	map	DOM object or string of a map you want to apply.
 *	@return	True on success
 */
imgmap.prototype.setMapHTML = function(map) {
	this.fireEvent('onSetMap', map);

	//remove all areas
	this.removeAllAreas();

	var oMap;
	if (typeof map == 'string') {
		var oHolder = document.createElement('DIV');
		oHolder.innerHTML = map;
		oMap = oHolder.firstChild;
	}
	else if (typeof map == 'object') {
		oMap = map;
	}
	if (!oMap || oMap.nodeName.toLowerCase() !== 'map') {return false;}
	this.mapname = oMap.name;
	this.mapid   = oMap.id;
	var newareas = oMap.getElementsByTagName('area');
	var shape, coords, href, alt, title, target, id;
	for (var i=0, le = newareas.length; i<le; i++) {
		shape = coords = href = alt = title = target = '';

		id = this.addNewArea();//btw id == this.currentid, just this form is a bit clearer

		shape = this._normShape(newareas[i].getAttribute('shape', 2));

		this.initArea(id, shape);

		if (newareas[i].getAttribute('coords', 2)) {
			//normalize coords
			coords = this._normCoords(newareas[i].getAttribute('coords', 2), shape);
			this.areas[id].lastInput = coords;
			//for area this one will be set in recalculate
		}

		href = newareas[i].getAttribute('href', 2);
		// CKEditor stored url to prevent mangling from the browser.
		var sSavedUrl = newareas[i].getAttribute( 'data-cke-saved-href' );
		if (sSavedUrl) {
			href = sSavedUrl;
		}
		if (href) {
			this.areas[id].ahref = href;
		}

		alt = newareas[i].getAttribute('alt');
		if (alt) {
			this.areas[id].aalt = alt;
		}

		title = newareas[i].getAttribute('title');
		if (!title) {title = alt;}
		if (title) {
			this.areas[id].atitle = title;
		}

		target = newareas[i].getAttribute('target');
		if (target) {target = target.toLowerCase();}

		this.areas[id].atarget = target;

		this._recalculate(id, coords);//contains repaint
		this.relaxArea(id);

		this.fireEvent('onAreaChanged', this.areas[id]);

	}//end for areas

	return true;
};


/**
 *	Adds a new area. It will later become a canvas.
 *	GUI should use the onAddArea callback to act accordingly.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-06 16:49:25
 *	@see	#initArea
 */
imgmap.prototype.addNewArea = function() {
	var lastarea = this._getLastArea();
	var id = (lastarea) ? lastarea.aid + 1 : 0;

	//insert new possibly? unknown area (will be initialized at mousedown)
	var area = this.areas[id] = document.createElement('DIV');
	area.id        = this.mapname + 'area' + id;
	area.aid       = id;
	area.shape     = "undefined";

	this.blurArea(this.currentid);

	this.currentid = id;
	this.fireEvent('onAddArea', id);
	return id;
};


/**
 *	Initialize a new area.
 *	Create the canvas, initialize it.
 *	Reset area parameters.
 *	@param	id	The id of the area (already existing with undefined shape)
 *	@param	shape	The shape the area will have (rect, circle, poly)
 */
imgmap.prototype.initArea = function(id, shape) {
	var area = this.areas[id];
	if (!area) {return;}//if all was erased, return
	//remove preinited dummy div or already placed canvas
	if (area.parentNode) {area.parentNode.removeChild(area);}
	if (area.label) {area.label.parentNode.removeChild(area.label);}

	//create CANVAS node
	area = this.areas[id] = document.createElement('CANVAS');

	this.pic_container.appendChild(area);
	this.pic_container.style.position = 'relative';

	if (typeof G_vmlCanvasManager != "undefined") {
		//override CANVAS with VML object
		area = this.areas[id] = G_vmlCanvasManager.initElement(area);
	}
	area.id        = this.mapname + 'area' + id;
	area.aid       = id;
	area.shape     = shape;
	area.ahref     = '';
	area.atitle    = '';
	area.aalt      = '';
	area.atarget   = '';
	area.style.position = 'absolute';
	area.style.top      = this.pic.offsetTop  + 'px';
	area.style.left     = this.pic.offsetLeft + 'px';
	this._setopacity(area, this.config.CL_DRAW_BG, this.config.draw_opacity);
	//hook event handlers
	area.ondblclick  = this.area_dblclick.bind(this);
	area.onmousedown = this.area_mousedown.bind(this);
	area.onmouseup   = this.area_mouseup.bind(this);
	area.onmousemove = this.area_mousemove.bind(this);
	area.onmouseover = this.area_mouseover.bind(this);
	area.onmouseout  = this.area_mouseout.bind(this);
	//initialize memory object
	this.memory[id] = {};
	this.memory[id].downx   = 0;
	this.memory[id].downy   = 0;
	this.memory[id].left    = 0;
	this.memory[id].top     = 0;
	this.memory[id].width   = 0;
	this.memory[id].height  = 0;
	this.memory[id].xpoints = [];
	this.memory[id].ypoints = [];
	//create label node
	area.label = document.createElement('DIV');
	this.pic_container.appendChild(area.label);
	area.label.className = this.config.label_class;
	this.assignCSS(area.label, this.config.label_style);
	area.label.style.position = 'absolute';
};


/**
 *	Resets area border and opacity to a normal state after drawing.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	15-02-2007 22:07:28
 *	@param	id	The id of the area.
 *	@see	#relaxAllAreas
 */
imgmap.prototype.relaxArea = function(id) {
	var area = this.areas[id];
	if (!area) {return;}
	this.fireEvent('onRelaxArea', id);
	if ( id != this.currentid )
	{
		this._setBorder(area, 'NORM');
		this._setopacity(area, this.config.CL_NORM_BG, this.config.norm_opacity);
	}
	else
		this.highlightArea(id);
};


/**
 *	Resets area border and opacity of all areas.
 *	Calls relaxArea on each of them.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	23-04-2007 23:31:09
 *	@see	#relaxArea
 */
imgmap.prototype.relaxAllAreas = function() {
	for (var i=0, le = this.areas.length; i<le; i++) {
		if (this.areas[i]) {
			this.relaxArea(i);
		}
	}
};


/**
 *	Set border of a given area according to style flag.
 *	Possible values of style: NORM, HIGHLIGHT, DRAW.
 *	Non-rectangle shapes wont get a border if config.bounding_box is false.
 *	@date	26-12-2008 22:34:41
 *	@param	id	The id of the area to set the border on.
 *	@param	style	Coloring style (NORM, HIGHLIGHT, DRAW), see relevant colors in config.
 *	@since	2.1
 */
imgmap.prototype._setBorder = function(area, style) {
	if (area.shape == 'rect' || this.config.bounding_box) {
		area.style.borderWidth = '1px';
		area.style.borderStyle = (style == 'DRAW' ? 'dotted' : 'solid');
		area.style.borderColor = this.config['CL_' + style + '_' + (area.shape == 'rect' ? 'SHAPE' : 'BOX')];
	}
	else {
		//clear border
		area.style.border = '';
	}
};


/**
 *	Set opacity of area to the given percentage, as well as set the background color.
 *	If percentage contains a dash(-), the setting of the opacity will be gradual.
 *	@param	area	The area object.
 *	@param	bgcolor	New background color
 *	@param	pct		Percentage of the opacity.
 */
imgmap.prototype._setopacity = function(area, bgcolor, pct) {
	if (bgcolor) {area.style.backgroundColor = bgcolor;}
	if (pct && typeof pct == 'string' && pct.match(/^\d*\-\d+$/)) {
		//gradual fade
		var parts = pct.split('-');
		if (typeof parts[0] != 'undefined') {
			//set initial opacity
			parts[0] = parseInt(parts[0], 10);
			this._setopacity(area, bgcolor, parts[0]);
		}
		if (typeof parts[1] != 'undefined') {
			parts[1] = parseInt(parts[1], 10);
			var curr = this._getopacity(area);

			var _this = this;
			var diff = Math.round(parts[1] - curr);
			if (diff > 5) {
				window.setTimeout(function () {_this._setopacity(area, null, '-'+parts[1]);}, 20);
				pct = 1*curr + 5;
			}
			else if (diff < -3) {
				window.setTimeout(function () {_this._setopacity(area, null, '-'+parts[1]);}, 20);
				pct = 1*curr - 3;
			}
			else {
				//final set
				pct = parts[1];
			}
		}
	}
	if (!isNaN(pct)) {
		pct = Math.round(parseInt(pct, 10));

		area.style.opacity = pct / 100;
		area.style.filter  = 'alpha(opacity='+pct+')';
	}
};


/**
 *	Get the currently set opacity of a given area.
 *	@author	adam
 *	@param	area	The area (canvas) you want to get opacity info from.
 *	@return	Opacity value in a range of 0-100.
 */
imgmap.prototype._getopacity = function(area) {
	if (area.style.opacity <= 1) {
		return area.style.opacity * 100;
	}
	if (area.style.filter) {
		//alpha(opacity=NaN)
		return parseInt(area.style.filter.replace(/alpha\(opacity\=([^\)]*)\)/ig, "$1"), 10);
	}
	return 100;//default opacity
};


/**
 *	Removes the area marked by id.
 *	Callback will call the GUI code to remove GUI elements.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	11-02-2007 20:40:58
 *	@param	id	The id of the area to remove.
 *	@see	#removeAllAreas
 */
imgmap.prototype.removeArea = function(id) {
	if (id === null || typeof id == "undefined") {return;}//exit if no id given

	try {
		//remove area and label
		//explicitly set some values to null to avoid IE circular reference memleak
		this.areas[id].label.parentNode.removeChild(this.areas[id].label);
		this.areas[id].parentNode.removeChild(this.areas[id]);
		this.areas[id].label.className = null;

		this.areas[id].label       = null;
		this.areas[id].onmouseover = null;
		this.areas[id].onmouseout  = null;
		this.areas[id].onmouseup   = null;
		this.areas[id].onmousedown = null;
		this.areas[id].onmousemove = null;

	}
	catch (err) {
	}
	this.areas[id] = null;
	this.fireEvent('onRemoveArea', id);
};


/**
 *	Removes all areas.
 *	Will call removeArea on all areas.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-07 11:55:34
 *	@see	#removeArea
 */
imgmap.prototype.removeAllAreas = function() {
	for (var i = 0, le = this.areas.length; i < le; i++) {
		if (this.areas[i]) {
			this.removeArea(i);
		}
	}
};


/**
 *	Scales all areas.
 *	Will store scale parameter in globalscale property.
 *	This is needed to know how to draw new areas on an already scaled canvas.
 *	@author	adam
 *	@date	02-11-2008 14:13:14
 *	@param scale	Scale factor (1-original, 0.5-half, 2-double, etc.)
 */
imgmap.prototype.scaleAllAreas = function(scale) {
	var rscale = 1;//relative scale
	try {
		rscale = scale / this.globalscale;
	}
	catch (err) {
		this.log("Invalid (global)scale", 1);
	}

	this.globalscale = scale;
	for (var i = 0, le = this.areas.length; i < le; i++) {
		if (this.areas[i] && this.areas[i].shape != 'undefined') {
			this.scaleArea(i, rscale);
		}
	}
};


/**
 *	Scales one area.
 *	@author	adam
 *	@date	02-11-2008 14:13:14
 *	@param rscale	Relative scale factor (1-keep, 0.5-half, 2-double, etc.)
 */
imgmap.prototype.scaleArea = function(id, rscale) {
	var area=this.areas[id];
	//set position and new dimensions
	area.style.top  = parseInt(area.style.top, 10) * rscale + 'px';
	area.style.left = parseInt(area.style.left, 10) * rscale + 'px';
	this.setAreaSize(id, area.width * rscale, area.height * rscale);

	//handle polygon coordinates scaling
	if (area.shape == 'poly') {
		for (var i=0, le = area.xpoints.length; i<le; i++) {
			area.xpoints[i]*= rscale;
			area.ypoints[i]*= rscale;
		}
	}

	this._repaint(area, this.config.CL_NORM_SHAPE);
	this._updatecoords(id);
};


/**
 *	Put label in the top left corner according to label config.
 *	By default it will contain the number of the area (area.aid)
 *	@param	id	The id of the area to add label to.
 */
imgmap.prototype._putlabel = function(id) {
	var area = this.areas[id];
	if (!area.label) {return;}//not yet inited
	try {
		if (!this.config.label) {
			area.label.innerHTML     = '';
			area.label.style.display = 'none';
		}
		else {
			area.label.style.display = '';
			var label = this.config.label;
			label = label.replace(/%n/g, String(id));
			label = label.replace(/%c/g, String(area.lastInput));
			label = label.replace(/%h/g, String(area.ahref));
			label = label.replace(/%a/g, String(area.aalt));
			label = label.replace(/%t/g, String(area.atitle));
			area.label.innerHTML = label;
		}
		//align to the top left corner
		area.label.style.top  = area.style.top;
		area.label.style.left = area.style.left;
	}
	catch (err) {
		this.log("Error putting label", 1);
	}
};


/**
 *	Set area title and alt (for IE) according to the hint configuration.
 *	This will show up in the usual yellow box when you hover over with the mouse.
 *	@param	id	The id of the area to set hint at.
 */
imgmap.prototype._puthint = function(id) {
	try {
		if (!this.config.hint) {
			this.areas[id].title = '';
			this.areas[id].alt   = '';
		}
		else {
			var hint = this.config.hint;
			hint = hint.replace(/%n/g, String(id));
			hint = hint.replace(/%c/g, String(this.areas[id].lastInput));
			hint = hint.replace(/%h/g, String(this.areas[id].ahref));
			hint = hint.replace(/%a/g, String(this.areas[id].aalt));
			hint = hint.replace(/%t/g, String(this.areas[id].atitle));
			this.areas[id].title = hint;
			this.areas[id].alt   = hint;
		}
	}
	catch (err) {
		this.log("Error putting hint", 1);
	}
};


/**
 *	Will call repaint on all areas.
 *	Useful when you change labeling or hint config on the GUI.
 *	@see #_repaint
 */
imgmap.prototype._repaintAll = function() {
	for (var i=0, le = this.areas.length; i<le; i++) {
		if (this.areas[i]) {
			this._repaint(this.areas[i], this.config.CL_NORM_SHAPE);
		}
	}
};


/**
 *	Repaints the actual canvas content.
 *	This is the only canvas drawing magic that is happening.
 *	In fact rectangles will not have any canvas content, just a normal css border.
 *	After repainting the canvas, it will call putlabel and puthint methods.
 *	@param	area	The area object.
 *	@param	color	Color of the line to draw on the canvas.
 *	@param	x	Only used for polygons as the newest control point x.
 *	@param	y	Only used for polygons as the newest control point y.
 */
imgmap.prototype._repaint = function(area, color, x, y) {
	var ctx;//canvas context
	var width, height, left, top;//canvas properties
	var i, le;//loop counter
	if (area.shape == 'circle') {
		width  = parseInt(area.style.width, 10);
		var radius = Math.floor(width/2) - 1;
		if (radius<0)
			radius=0;

		//get canvas context
		ctx = area.getContext("2d");
		//clear canvas
		ctx.clearRect(0, 0, width, width);
		//draw circle
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.arc(radius, radius, radius, 0, Math.PI*2, 0);
		ctx.stroke();
		ctx.closePath();
		//draw center
		ctx.strokeStyle = this.config.CL_KNOB;
		ctx.strokeRect(radius, radius, 1, 1);
		//put label
		this._putlabel(area.aid);
		this._puthint(area.aid);
	}
	else if (area.shape == 'rect') {
		//put label
		this._putlabel(area.aid);
		this._puthint(area.aid);
	}
	else if (area.shape == 'poly') {
		width  =  parseInt(area.style.width, 10);
		height =  parseInt(area.style.height, 10);
		left   =  parseInt(area.style.left, 10);
		top    =  parseInt(area.style.top, 10);
		if (area.xpoints) {
			//get canvas context
			ctx = area.getContext("2d");
			//clear canvas
			ctx.clearRect(0, 0, width, height);
			//draw polygon
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.moveTo(area.xpoints[0] - left, area.ypoints[0] - top);
			for (i = 1, le = area.xpoints.length; i < le; i++) {
				ctx.lineTo(area.xpoints[i] - left , area.ypoints[i] - top);
			}
			if (this.is_drawing == this.DM_POLYGON_DRAW || this.is_drawing == this.DM_POLYGON_LASTDRAW) {
				//only draw to the current position if not moving
				ctx.lineTo(x - left - 5 , y - top - 5);
			}
			ctx.lineTo(area.xpoints[0] - left , area.ypoints[0] - top);
			ctx.stroke();
			ctx.closePath();
		}
		//put label
		this._putlabel(area.aid);
		this._puthint(area.aid);
	}
};


/**
 *	Updates Area coordinates.
 *	Called when needed, eg. on mousemove, mousedown.
 *	Also updates html container value (thru hook).
 *	Calls callback onAreaChanged so that GUI can follow.
 *	This is an important hook to your GUI.
 *	Uses globalscale to scale real coordinates to area coordinates.
 *	@date	2006.10.24. 22:39:27
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@param	id	The id of the area.
 */
imgmap.prototype._updatecoords = function(id) {
	var area = this.areas[id];
	var left   = Math.round(parseInt(area.style.left, 10) / this.globalscale);
	var top    = Math.round(parseInt(area.style.top, 10) / this.globalscale);
	var height = Math.round(parseInt(area.style.height, 10) / this.globalscale);
	var width  = Math.round(parseInt(area.style.width, 10) / this.globalscale);

	var value = '';
	if (area.shape == 'rect') {
		value = left + ',' + top + ',' + (left + width) + ',' + (top + height);
		area.lastInput = value;
	}
	else if (area.shape == 'circle') {
		var radius = Math.floor(width/2) - 1;
		value = (left + radius) + ',' +	(top + radius) + ',' + radius;
		area.lastInput = value;
	}
	else if (area.shape == 'poly') {
		if (area.xpoints) {
			for (var i=0, le = area.xpoints.length; i<le; i++) {
				value+= Math.round(area.xpoints[i] / this.globalscale) + ',' +
						Math.round(area.ypoints[i] / this.globalscale) + ',';
			}
			value = value.substring(0, value.length - 1);
		}
		area.lastInput = value;
	}

	this.fireEvent('onAreaChanged', area);
};


/**
 *	Updates the visual representation of the area with the given id according
 *	to the new coordinates that typically come from an input on the GUI.
 *	Uses globalscale to scale area coordinates to real coordinates.
 *	@date	2006.10.24. 22:46:55
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@param	id	The id of the area.
 *	@param	coords	The new coords, they will be normalized.
 */
imgmap.prototype._recalculate = function(id, coords) {
	var area = this.areas[id];
	try {
		if (coords) {
			coords = this._normCoords(coords, area.shape, 'preserve');
		}
		else {
			coords = area.lastInput || '' ;
		}

		var parts   = coords.split(',');
		if (area.shape == 'rect') {
			if (parts.length != 4 ||
				parseInt(parts[0], 10) > parseInt(parts[2], 10) ||
				parseInt(parts[1], 10) > parseInt(parts[3], 10)) {throw "invalid coords";}
			area.style.left   = this.globalscale * (this.pic.offsetLeft + parseInt(parts[0], 10)) + 'px';
			area.style.top    = this.globalscale * (this.pic.offsetTop  + parseInt(parts[1], 10)) + 'px';
			this.setAreaSize(id, this.globalscale * (parts[2] - parts[0]), this.globalscale  * (parts[3] - parts[1]));
			this._repaint(area, this.config.CL_NORM_SHAPE);
		}
		else if (area.shape == 'circle') {
			if (parts.length != 3 ||
				parseInt(parts[2], 10) < 0) {throw "invalid coords";}
			var width = 2 * (parts[2]);
			this.setAreaSize(id, this.globalscale * width, this.globalscale * width);
			area.style.left   = this.globalscale * (this.pic.offsetLeft + parseInt(parts[0], 10) - width/2) + 'px';
			area.style.top    = this.globalscale * (this.pic.offsetTop  + parseInt(parts[1], 10) - width/2) + 'px';
			this._repaint(area, this.config.CL_NORM_SHAPE);
		}
		else if (area.shape == 'poly') {
			if (parts.length < 2) {throw "invalid coords";}
			area.xpoints = [];
			area.ypoints = [];
			for (var i=0, le = parts.length; i<le; i+=2) {
				area.xpoints[area.xpoints.length]  = this.globalscale * (this.pic.offsetLeft + parseInt(parts[i], 10));
				area.ypoints[area.ypoints.length]  = this.globalscale * (this.pic.offsetTop  + parseInt(parts[i+1], 10));
				this._polygongrow(area, this.globalscale * parts[i], this.globalscale * parts[i+1]);
			}
			this._polygonshrink(area);//includes repaint
		}
	}
	catch (err) {
		var msg = (err.message) ? err.message : 'error calculating coordinates';
		this.log(msg, 1);
		this.statusMessage(this.strings.ERR_INVALID_COORDS);
		if (area.lastInput) {
			this.fireEvent('onAreaChanged', area);
		}
		this._repaint(area, this.config.CL_NORM_SHAPE);
		return;
	}
	//on success update lastInput
	area.lastInput = coords;
};


/**
 *	Grow polygon area to be able to contain the given new coordinates.
 *	@author	adam
 *	@param	area	The area to grow.
 *	@param	newx	The new coordinate x.
 *	@param	newy	The new coordinate y.
 *	@see	#_polygonshrink
 */
imgmap.prototype._polygongrow = function(area, newx, newy) {
	var xdiff = newx - parseInt(area.style.left, 10);
	var ydiff = newy - parseInt(area.style.top , 10);
	var pad   = 0;//padding on the edges
	var pad2  = 0;//twice the padding

	if (newx < parseInt(area.style.left, 10)) {
		area.style.left   = (newx - pad) + 'px';
		this.setAreaSize(area.aid, parseInt(area.style.width, 10) + Math.abs(xdiff) + pad2, null);
	}
	else if (newx > parseInt(area.style.left, 10) + parseInt(area.style.width, 10)) {
		this.setAreaSize(area.aid, newx - parseInt(area.style.left, 10) + pad2, null);
	}
	if (newy < parseInt(area.style.top, 10)) {
		area.style.top    = (newy - pad) + 'px';
		this.setAreaSize(area.aid, null, parseInt(area.style.height, 10) + Math.abs(ydiff) + pad2);
	}
	else if (newy > parseInt(area.style.top, 10) + parseInt(area.style.height, 10)) {
		this.setAreaSize(area.aid, null, newy - parseInt(area.style.top, 10) + pad2);
	}
};


/**
 *	Shrink the polygon bounding area to the necessary size, by first reducing it
 *	to the minimum, and then gradually growing it.
 *	We need this because while we were drawing the polygon, it might have expanded
 *	the canvas more than needed.
 *	Will repaint the area.
 *	@author	adam
 *	@param	area	The area to shrink.
 *	@see	#_polygongrow
 */
imgmap.prototype._polygonshrink = function(area) {
	area.style.left = (area.xpoints[0]) + 'px';
	area.style.top  = (area.ypoints[0]) + 'px';
	this.setAreaSize(area.aid, 0, 0);
	for (var i=0, le = area.xpoints.length; i<le; i++) {
		this._polygongrow(area, area.xpoints[i], area.ypoints[i]);
	}
	this._repaint(area, this.config.CL_NORM_SHAPE);
};


/**
 *	EVENT HANDLER: Handles mousemove on the image.
 *	This is the main drawing routine.
 *	Depending on the current shape, will draw the rect/circle/poly to the new position.
 *	@param	e	The event object.
 */
imgmap.prototype.img_mousemove = function(e) {
	//function level var declarations
	var x;
	var y;
	var xdiff;
	var ydiff;
	var diff;

	//event.x is relative to parent element, but page.x is NOT
	//pos coordinates are the same absolute coords, offset coords are relative to parent
	var pos = this._getPos(this.pic);
	x = (this.isMSIE) ? (window.event.x - this.pic.offsetLeft) : (e.clientX - pos.x);
	y = (this.isMSIE) ? (window.event.y - this.pic.offsetTop)  : (e.clientY - pos.y);

	//exit if outside image
	if (x<0 || y<0 || x>this.pic.width || y>this.pic.height) {return;}

	//old dimensions that need to be updated in this function
	if (this.memory[this.currentid]) {
		var top    = this.memory[this.currentid].top;
		var left   = this.memory[this.currentid].left;
		var height = this.memory[this.currentid].height;
		var width  = this.memory[this.currentid].width;
	}

	var area = this.areas[this.currentid];
	// Handle shift state for Safari
	// Safari doesn't generate keyboard events for modifiers: http://bugs.webkit.org/show_bug.cgi?id=11696
	if (this.isSafari) {
		if (e.shiftKey) {
			if (this.is_drawing == this.DM_RECTANGLE_DRAW) {
				this.is_drawing = this.DM_SQUARE_DRAW;
				this.statusMessage(this.strings.SQUARE2_DRAW);
			}
		}
		else {
			if (this.is_drawing == this.DM_SQUARE_DRAW && area.shape == 'rect') {
				//not for circle!
				this.is_drawing = this.DM_RECTANGLE_DRAW;
				this.statusMessage(this.strings.RECTANGLE_DRAW);
			}
		}
	}

	if (this.is_drawing == this.DM_RECTANGLE_DRAW) {
		//rectangle mode
		this.fireEvent('onDrawArea', this.currentid);
		xdiff = x - this.memory[this.currentid].downx;
		ydiff = y - this.memory[this.currentid].downy;

		this.setAreaSize(this.currentid, Math.abs(xdiff), Math.abs(ydiff));
		if (xdiff < 0) {
			area.style.left = (x + 1) + 'px';
		}
		if (ydiff < 0) {
			area.style.top  = (y + 1) + 'px';
		}
	}
	else if (this.is_drawing == this.DM_SQUARE_DRAW) {
		//square mode - align to shorter side
		this.fireEvent('onDrawArea', this.currentid);
		xdiff = x - this.memory[this.currentid].downx;
		ydiff = y - this.memory[this.currentid].downy;
		if (Math.abs(xdiff) < Math.abs(ydiff)) {
			diff = Math.abs(parseInt(xdiff, 10));
		}
		else {
			diff = Math.abs(parseInt(ydiff, 10));
		}

		this.setAreaSize(this.currentid, diff, diff);
		if (xdiff < 0) {
			area.style.left = (this.memory[this.currentid].downx + diff*-1) + 'px';
		}
		if (ydiff < 0) {
			area.style.top = (this.memory[this.currentid].downy + diff*-1 + 1) + 'px';
		}
	}
	else if (this.is_drawing == this.DM_POLYGON_DRAW) {
		//polygon mode
		this.fireEvent('onDrawArea', this.currentid);
		this._polygongrow(area, x, y);
	}
	else if (this.is_drawing == this.DM_RECTANGLE_MOVE || this.is_drawing == this.DM_SQUARE_MOVE) {
		this.fireEvent('onMoveArea', this.currentid);
		x = x - this.memory[this.currentid].rdownx;
		y = y - this.memory[this.currentid].rdowny;
		if (x + width > this.pic.width || y + height > this.pic.height) {return;}
		if (x < 0 || y < 0) {return;}

		area.style.left = x + 1 + 'px';
		area.style.top  = y + 1 + 'px';
	}
	else if (this.is_drawing == this.DM_POLYGON_MOVE) {
		this.fireEvent('onMoveArea', this.currentid);
		x = x - this.memory[this.currentid].rdownx;
		y = y - this.memory[this.currentid].rdowny;
		if (x + width > this.pic.width || y + height > this.pic.height) {return;}
		if (x < 0 || y < 0) {return;}
		xdiff = x - left;
		ydiff = y - top;
		if (area.xpoints) {
			for (var i=0, le = area.xpoints.length; i<le; i++) {
				area.xpoints[i] = this.memory[this.currentid].xpoints[i] + xdiff;
				area.ypoints[i] = this.memory[this.currentid].ypoints[i] + ydiff;
			}
		}
		area.style.left = x + 'px';
		area.style.top  = y + 'px';
	}
	else if (this.is_drawing == this.DM_SQUARE_RESIZE_LEFT) {
		this.fireEvent('onResizeArea', this.currentid);
		diff = x - left;

		if ((width  + (-1 * diff)) > 0) {
			//real resize left
			area.style.left   = x + 1 + 'px';
			area.style.top    = (top    + (diff/2)) + 'px';
			this.setAreaSize(this.currentid, parseInt(width  + (-1 * diff), 10), parseInt(height + (-1 * diff), 10));
		}
		else {
			//jump to another state
			this.memory[this.currentid].width  = 0;
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].left   = x;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_SQUARE_RESIZE_RIGHT;
		}
	}
	else if (this.is_drawing == this.DM_SQUARE_RESIZE_RIGHT) {
		this.fireEvent('onResizeArea', this.currentid);
		diff = x - left - width;
		if ((width  + (diff)) - 1 > 0) {
			//real resize right
			area.style.top    = (top    + (-1* diff/2)) + 'px';
			this.setAreaSize(this.currentid, (width  + (diff)) - 1, (height + (diff)));
		}
		else {
			//jump to another state
			this.memory[this.currentid].width  = 0;
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].left   = x;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_SQUARE_RESIZE_LEFT;
		}
	}
	else if (this.is_drawing == this.DM_SQUARE_RESIZE_TOP) {
		this.fireEvent('onResizeArea', this.currentid);
		diff = y - top;
		if ((width  + (-1 * diff)) > 0) {
			//real resize top
			area.style.top    = y + 1 + 'px';
			area.style.left   = (left   + (diff/2)) + 'px';
			this.setAreaSize(this.currentid, (width  + (-1 * diff)), (height + (-1 * diff)));
		}
		else {
			//jump to another state
			this.memory[this.currentid].width  = 0;
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].left   = x;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_SQUARE_RESIZE_BOTTOM;
		}
	}
	else if (this.is_drawing == this.DM_SQUARE_RESIZE_BOTTOM) {
		this.fireEvent('onResizeArea', this.currentid);
		diff = y - top - height;
		if ((width  + (diff)) - 1 > 0) {
			//real resize bottom
			area.style.left   = (left   + (-1* diff/2)) + 'px';
			this.setAreaSize(this.currentid, (width  + (diff)) - 1 , (height + (diff)) - 1);
		}
		else {
			//jump to another state
			this.memory[this.currentid].width  = 0;
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].left   = x;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_SQUARE_RESIZE_TOP;
		}
	}
	else if (this.is_drawing == this.DM_RECTANGLE_RESIZE_LEFT) {
		this.fireEvent('onResizeArea', this.currentid);
		xdiff = x - left;
		if (width + (-1 * xdiff) > 0) {
			//real resize left
			area.style.left = x + 1 + 'px';
			this.setAreaSize(this.currentid, width + (-1 * xdiff), null);
		}
		else {
			//jump to another state
			this.memory[this.currentid].width = 0;
			this.memory[this.currentid].left  = x;
			this.is_drawing = this.DM_RECTANGLE_RESIZE_RIGHT;
		}
	}
	else if (this.is_drawing == this.DM_RECTANGLE_RESIZE_RIGHT) {
		this.fireEvent('onResizeArea', this.currentid);
		xdiff = x - left - width;
		if ((width  + (xdiff)) - 1 > 0) {
			//real resize right
			this.setAreaSize(this.currentid, (width  + (xdiff)) - 1, null);
		}
		else {
			//jump to another state
			this.memory[this.currentid].width = 0;
			this.memory[this.currentid].left  = x;
			this.is_drawing = this.DM_RECTANGLE_RESIZE_LEFT;
		}
	}
	else if (this.is_drawing == this.DM_RECTANGLE_RESIZE_TOP) {
		this.fireEvent('onResizeArea', this.currentid);
		ydiff = y - top;
		if ((height + (-1 * ydiff)) > 0) {
			//real resize top
			area.style.top   = y + 1 + 'px';
			this.setAreaSize(this.currentid, null, (height + (-1 * ydiff)));
		}
		else {
			//jump to another state
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_RECTANGLE_RESIZE_BOTTOM;
		}
	}
	else if (this.is_drawing == this.DM_RECTANGLE_RESIZE_BOTTOM) {
		this.fireEvent('onResizeArea', this.currentid);
		ydiff = y - top - height;
		if ((height + (ydiff)) - 1 > 0) {
			//real resize bottom
			this.setAreaSize(this.currentid, null, (height + (ydiff)) - 1);
		}
		else {
			//jump to another state
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_RECTANGLE_RESIZE_TOP;
		}
	}

	//repaint canvas elements
	if (this.is_drawing) {
		this._repaint(area, this.config.CL_DRAW_SHAPE, x, y);
		this._updatecoords(this.currentid);
	}

};


/**
 *	EVENT HANDLER: Handles mouseup on the image.
 *	Handles dragging and resizing.
 *	@param	e	The event object.
 */
imgmap.prototype.img_mouseup = function(e) {
	var pos = this._getPos(this.pic);
	var x = (this.isMSIE) ? (window.event.x - this.pic.offsetLeft) : (e.clientX - pos.x);
	var y = (this.isMSIE) ? (window.event.y - this.pic.offsetTop)  : (e.clientY - pos.y);

	//for everything that is move or resize
	if (this.is_drawing != this.DM_RECTANGLE_DRAW &&
		this.is_drawing != this.DM_SQUARE_DRAW &&
		this.is_drawing != this.DM_POLYGON_DRAW &&
		this.is_drawing != this.DM_POLYGON_LASTDRAW) {
		//end dragging
		this.draggedId = null;
		//finish state
		this.is_drawing = 0;
		this.statusMessage(this.strings.READY);
		this.relaxArea(this.currentid);
		if (this.areas[this.currentid] == this._getLastArea()) {
			return;
		}
		this.memory[this.currentid].downx  = x;
		this.memory[this.currentid].downy  = y;
	}
};


/**
 *	EVENT HANDLER: Handles mousedown on the image.
 *	Handles beggining or end of draw, or polygon point set.
 *	@param	e	The event object.
 */
imgmap.prototype.img_mousedown = function(e) {
	var pos = this._getPos(this.pic);
	var x = (this.isMSIE) ? (window.event.x - this.pic.offsetLeft) : (e.clientX - pos.x);
	var y = (this.isMSIE) ? (window.event.y - this.pic.offsetTop)  : (e.clientY - pos.y);

	// Handle the Shift state
	if (!e) {
		e = window.event;
	}

	if (e.shiftKey)	{
		if (this.is_drawing == this.DM_POLYGON_DRAW) {
			this.is_drawing = this.DM_POLYGON_LASTDRAW;
		}
	}
	var area = this.areas[this.currentid];
	if (this.is_drawing == this.DM_POLYGON_DRAW) {
		//its not finish state yet
		area.xpoints[area.xpoints.length] = x - 5;
		area.ypoints[area.ypoints.length] = y - 5;
		this.memory[this.currentid].downx  = x;
		this.memory[this.currentid].downy  = y;
		return;
	}
	else if (this.is_drawing && this.is_drawing != this.DM_POLYGON_DRAW) {
		//finish any other state
		if (this.is_drawing == this.DM_POLYGON_LASTDRAW) {
			//add last controlpoint and update coords
			area.xpoints[area.xpoints.length] = x - 5;
			area.ypoints[area.ypoints.length] = y - 5;
			this._updatecoords(this.currentid);
			this.is_drawing = 0;
			this._polygonshrink(area);
		}
		this.is_drawing = 0;
		this.statusMessage(this.strings.READY);
		this.relaxArea(this.currentid);
		if (this.areas[this.currentid] == this._getLastArea()) {
			return;
		}
		return;
	}

	if (!this.nextShape) {return;}
	this.addNewArea();
	this.initArea(this.currentid, this.nextShape);

	if (this.areas[this.currentid].shape == 'poly') {
		this.is_drawing = this.DM_POLYGON_DRAW;
		this.statusMessage(this.strings.POLYGON_DRAW);

		this.areas[this.currentid].style.left = x + 'px';
		this.areas[this.currentid].style.top  = y + 'px';
		this.areas[this.currentid].style.width  = 0;
		this.areas[this.currentid].style.height = 0;
		this.areas[this.currentid].xpoints = [];
		this.areas[this.currentid].ypoints = [];
		this.areas[this.currentid].xpoints[0] = x;
		this.areas[this.currentid].ypoints[0] = y;
	}
	else if (this.areas[this.currentid].shape == 'rect') {
		this.is_drawing = this.DM_RECTANGLE_DRAW;
		this.statusMessage(this.strings.RECTANGLE_DRAW);

		this.areas[this.currentid].style.left = x + 'px';
		this.areas[this.currentid].style.top  = y + 'px';
		this.areas[this.currentid].style.width  = 0;
		this.areas[this.currentid].style.height = 0;
	}
	else if (this.areas[this.currentid].shape == 'circle') {
		this.is_drawing = this.DM_SQUARE_DRAW;
		this.statusMessage(this.strings.SQUARE_DRAW);

		this.areas[this.currentid].style.left = x + 'px';
		this.areas[this.currentid].style.top  = y + 'px';
		this.areas[this.currentid].style.width  = 0;
		this.areas[this.currentid].style.height = 0;
	}

	this._setBorder(this.areas[this.currentid], 'DRAW');
	this.memory[this.currentid].downx  = x;
	this.memory[this.currentid].downy  = y;
};


/**
 *	Highlights a given area.
 *	Sets opacity and repaints.
 *	@date	2007.12.28. 18:23:00
 *	@param	id	The id of the area to blur.
 *	@param	flag	Modifier, possible values: grad - for gradual fade in
 */
imgmap.prototype.highlightArea = function(id, fire) {
	if (this.is_drawing) {return;}//exit if in drawing state
	var area = this.areas[id];
	if (area && area.shape != 'undefined') {
		//area exists - highlight it
		if (fire)
			this.fireEvent('onFocusArea', area);

		this._setBorder(area, 'HIGHLIGHT');
		this._setopacity(area, this.config.CL_HIGHLIGHT_BG,  '-' + this.config.highlight_opacity);
		this._repaint(area, this.config.CL_HIGHLIGHT_SHAPE);
	}
};


/**
 *	Blurs a given area.
 *	Sets opacity and repaints.
 *	@date	2007.12.28. 18:23:26
 *	@param	id	The id of the area to blur.
 *	@param	flag	Modifier, possible values: grad - for gradual fade out
 */
imgmap.prototype.blurArea = function(id, fire) {
	if (this.is_drawing) {return;}//exit if in drawing state
	var area = this.areas[id];
	if (area && area.shape != 'undefined') {
		//area exists - fade it back
		if (fire)
			this.fireEvent('onBlurArea', area);

		this._setBorder(area, 'NORM');
		this._setopacity(area, this.config.CL_NORM_BG, '-' + this.config.norm_opacity);
		this._repaint(area, this.config.CL_NORM_SHAPE);
	}
};


/**
 *	EVENT HANDLER: Handles event of mousemove on imgmap areas.
 *	- changes cursor depending where we are inside the area (buggy in opera)
 *	- handles area resize
 *	- handles area move
 *	@url	http://evolt.org/article/Mission_Impossible_mouse_position/17/23335/index.html
 *	@url	http://my.opera.com/community/forums/topic.dml?id=239498&t=1217158015&page=1
 *	@author	adam
 *	@param	e	The event object.
 */
imgmap.prototype.area_mousemove = function(e) {
	if (!this.is_drawing) {
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		//opera fix - adam - 04-12-2007 23:14:05
		if (this.isOpera) {
			e.layerX = e.offsetX;
			e.layerY = e.offsetY;
		}
		var xdiff = (this.isMSIE) ? (window.event.offsetX) : (e.layerX);
		var ydiff = (this.isMSIE) ? (window.event.offsetY) : (e.layerY);
		// Alfonso
		if (CKEDITOR.env.webkit)
		{
			xdiff -= window.scrollX;
			ydiff -= window.scrollY;
		}
		var resizable = (obj.shape == 'rect' || obj.shape == 'circle');
		if (resizable && xdiff < 6 && ydiff > 6) {
			//move left
			obj.style.cursor = 'w-resize';
		}
		else if (resizable && xdiff > parseInt(obj.style.width, 10) - 6  && ydiff > 6) {
			//move right
			obj.style.cursor = 'e-resize';
		}
		else if (resizable && xdiff > 6 && ydiff < 6) {
			//move top
			obj.style.cursor = 'n-resize';
		}
		else if (resizable && ydiff > parseInt(obj.style.height, 10) - 6  && xdiff > 6) {
			//move bottom
			obj.style.cursor = 's-resize';
		}
		else {
			//move all
			obj.style.cursor = 'move';
		}
		if (obj.aid != this.draggedId) {
			//not dragged or different
			if (obj.style.cursor == 'move') {obj.style.cursor = 'default';}
			return;
		}
		var area = this.areas[this.currentid];
		//moved here from mousedown
		if (xdiff < 6 && ydiff > 6) {
			//move left
			if (area.shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_RESIZE_LEFT;
				this.statusMessage(this.strings.SQUARE_RESIZE_LEFT);
			}
			else if (area.shape == 'rect') {
				this.is_drawing = this.DM_RECTANGLE_RESIZE_LEFT;
				this.statusMessage(this.strings.RECTANGLE_RESIZE_LEFT);
			}
		}
		else if (xdiff > parseInt(area.style.width, 10) - 6  && ydiff > 6) {
			//move right
			if (area.shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_RESIZE_RIGHT;
				this.statusMessage(this.strings.SQUARE_RESIZE_RIGHT);
			}
			else if (area.shape == 'rect') {
				this.is_drawing = this.DM_RECTANGLE_RESIZE_RIGHT;
				this.statusMessage(this.strings.RECTANGLE_RESIZE_RIGHT);
			}
		}
		else if (xdiff > 6 && ydiff < 6) {
			//move top
			if (area.shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_RESIZE_TOP;
				this.statusMessage(this.strings.SQUARE_RESIZE_TOP);
			}
			else if (area.shape == 'rect') {
				this.is_drawing = this.DM_RECTANGLE_RESIZE_TOP;
				this.statusMessage(this.strings.RECTANGLE_RESIZE_TOP);
			}
		}
		else if (ydiff > parseInt(area.style.height, 10) - 6  && xdiff > 6) {
			//move bottom
			if (area.shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_RESIZE_BOTTOM;
				this.statusMessage(this.strings.SQUARE_RESIZE_BOTTOM);
			}
			else if (area.shape == 'rect') {
				this.is_drawing = this.DM_RECTANGLE_RESIZE_BOTTOM;
				this.statusMessage(this.strings.RECTANGLE_RESIZE_BOTTOM);
			}
		}
		else/*if (xdiff < 10 && ydiff < 10 ) */{
			//move all
			if (area.shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_MOVE;
				this.statusMessage(this.strings.SQUARE_MOVE);
				this.memory[this.currentid].rdownx = xdiff;
				this.memory[this.currentid].rdowny = ydiff;
			}
			else if (area.shape == 'rect') {
				this.is_drawing = this.DM_RECTANGLE_MOVE;
				this.statusMessage(this.strings.RECTANGLE_MOVE);
				this.memory[this.currentid].rdownx = xdiff;
				this.memory[this.currentid].rdowny = ydiff;
			}
			else if (area.shape == 'poly') {
				if (area.xpoints) {
					for (var i=0, le = area.xpoints.length; i<le; i++) {
						this.memory[this.currentid].xpoints[i] = area.xpoints[i];
						this.memory[this.currentid].ypoints[i] = area.ypoints[i];
					}
				}

				if (area.shape == 'poly') {
					this.is_drawing = this.DM_POLYGON_MOVE;
					this.statusMessage(this.strings.POLYGON_MOVE);
				}

				this.memory[this.currentid].rdownx = xdiff;
				this.memory[this.currentid].rdowny = ydiff;
			}
		}

		//common memory settings (preparing to move or resize)
		this.memory[this.currentid].width  = parseInt(area.style.width, 10);
		this.memory[this.currentid].height = parseInt(area.style.height, 10);
		this.memory[this.currentid].top    = parseInt(area.style.top, 10);
		this.memory[this.currentid].left   = parseInt(area.style.left, 10);
		this._setBorder(area, 'DRAW');
		this._setopacity(area, this.config.CL_DRAW_BG, this.config.draw_opacity);
	}
	else {
		//if drawing and not ie, have to propagate to image event
		this.img_mousemove(e);
	}
};


/**
 *	EVENT HANDLER: Handles event of mouseup on imgmap areas.
 *	Basically clears draggedId.
 *	@author	adam
 *	@param	e	The event object
 */
imgmap.prototype.area_mouseup = function(e) {
	if (!this.is_drawing) {
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		if (this.areas[this.currentid] != obj) {
			//trying to draw on a different canvas,switch to this one
			if (typeof obj.aid == 'undefined') {
				this.log('Cannot identify target area', 1);
				return;
			}
		}
		this.draggedId = null;
	}
	else {
		//if drawing and not ie, have to propagate to image event
		this.img_mouseup(e);
	}
};


/**
 *	EVENT HANDLER: Handles event of mouseover on imgmap areas.
 *	Calls gradual highlight on the given area.
 *	@author	adam
 *	@param	e	The event object
 */
imgmap.prototype.area_mouseover = function(e) {
	if (!this.is_drawing) {
		//identify source object
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		this.highlightArea(obj.aid, true);
	}
};


/**
 *	EVENT HANDLER: Handles event of mouseout on imgmap areas.
 *	Calls gradient blur on the given area.
 *	@author	adam
 *	@param	e	The event object
 */
imgmap.prototype.area_mouseout = function(e) {
	if (!this.is_drawing) {

		//identify source object
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}

		// Only blur the area if it isn't the current one
		if (this.currentid != obj.aid)
			this.blurArea(obj.aid, true);
	}
};


/**
 *	EVENT HANDLER: Handles event of double click on imgmap areas.
 *	Basically only fires the custom callback.
 *	@author	Colin Bell
 *	@param	e	The event object
 */
imgmap.prototype.area_dblclick = function(e) {
	if (!this.is_drawing) {
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		if (this.areas[this.currentid] != obj) {
			//trying to draw on a different canvas, switch to this one
			if (typeof obj.aid == 'undefined') {
				this.log('Cannot identify target area', 1);
				return;
			}
			this.blurArea(this.currentid);
			this.currentid = obj.aid;
		}
		this.fireEvent('onDblClickArea', this.areas[this.currentid]);
		//stop event propagation to document level
		if (this.isMSIE) {
			window.event.cancelBubble = true;
		}
		else {
			e.stopPropagation();
		}
	}
};


/**
 *	EVENT HANDLER: Handles event of mousedown on imgmap areas.
 *	Sets the variables draggedid, selectedid and currentid to the given area.
 *	@author	adam
 *	@param	e	The event object
 */
imgmap.prototype.area_mousedown = function(e) {
	if (!this.is_drawing) {
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		if (this.areas[this.currentid] != obj) {
			//trying to draw on a different canvas, switch to this one
			if (typeof obj.aid == 'undefined') {
				this.log('Cannot identify target area', 1);
				return;
			}

			this.blurArea(this.currentid);
			this.currentid = obj.aid;
		}

		this.draggedId  = this.currentid;
		this.selectedId = this.currentid;
		this.fireEvent('onSelectArea', this.areas[this.currentid]);
		//stop event propagation to document level
		if (this.isMSIE) {
			window.event.cancelBubble = true;
		}
		else {
			e.stopPropagation();
		}
	}
	else {
		//if drawing and not ie, have to propagate to image event
		this.img_mousedown(e);
	}
};


/**
 *	EVENT HANDLER: Handles event 'keydown' on document.
 *	Handles SHIFT hold while drawing.
 *	Note: Safari doesn't generate keyboard events for modifiers:
 *	@url	http://bugs.webkit.org/show_bug.cgi?id=11696
 *	@author	adam
 *	@param	e	The event object
 */
imgmap.prototype.doc_keydown = function(e) {
	var key = (this.isMSIE) ? event.keyCode : e.keyCode;

	if (key == 46) {
		//delete key pressed
		if (this.selectedId !== null && !this.is_drawing) {this.removeArea(this.selectedId);}
	}
	else if (key == 16) {
		//shift key pressed
		if (this.is_drawing == this.DM_RECTANGLE_DRAW) {
			this.is_drawing = this.DM_SQUARE_DRAW;
			this.statusMessage(this.strings.SQUARE2_DRAW);
		}
	}
};


/**
 *	EVENT HANDLER: Handles event 'keyup' on document.
 *	Handles SHIFT release while drawing.
 *	@author	adam
 *	@param	e	The event object
 */
imgmap.prototype.doc_keyup = function(e) {
	var key = (this.isMSIE) ? event.keyCode : e.keyCode;

	if (key == 16) {
		//shift key released
		if (this.is_drawing == this.DM_SQUARE_DRAW && this.areas[this.currentid].shape == 'rect') {
			//not for circle!
			this.is_drawing = this.DM_RECTANGLE_DRAW;
			this.statusMessage(this.strings.RECTANGLE_DRAW);
		}
	}
};


/**
 *	EVENT HANDLER: Handles event 'mousedown' on document.
 *	@author	adam
 *	@param	e	The event object
 */
imgmap.prototype.doc_mousedown = function(e) {
	if (!this.is_drawing) {
		this.selectedId = null;
	}
};


/**
 *	Get the real position of the element.
 *	Deal with browser differences when trying to get the position of an area.
 *	@param	element	The element you want the position of.
 *	@return	An object with x and y members.
 */
imgmap.prototype._getPos = function(element) {

	var bounding = element.getBoundingClientRect();
	return {x: bounding.left, y: bounding.top};
};


/**
 *	Gets the last (visible and editable) area.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-15 16:34:51
 *	@returns	The last area object or null.
 */
imgmap.prototype._getLastArea = function() {
	for (var i = this.areas.length-1; i>=0; i--) {
		if (this.areas[i]) {
			return this.areas[i];
		}
	}
	return null;
};


/**
 *	Parses cssText to single style declarations.
 *	@author	adam
 *	@date	25-09-2007 18:19:51
 *	@param obj	The DOM object to apply styles on.
 *	@param cssText	The css declarations to apply.
 */
imgmap.prototype.assignCSS = function(obj, cssText) {
	var parts = cssText.split(';');
	for (var i = 0; i < parts.length; i++) {
		var p = parts[i].split(':');
		//we need to camelcase by - signs
		var pp = this.trim(p[0]).split('-');
		var prop = pp[0];
		for (var j = 1; j < pp.length; j++) {
			//replace first letters to uppercase
			prop+= pp[j].replace(/^\w/, pp[j].substring(0,1).toUpperCase());
		}
		obj.style[this.trim(prop)] = this.trim(p[1]);
	}
};


/**
 *	To fire callback hooks on custom events, passing them the object of the event.
 *	@author	adam
 *	@date	13-10-2007 15:24:49
 *	@param evt	The type of event
 *	@param obj	The object of the event. (can be an id, a string, an object, whatever is most relevant)
 */
imgmap.prototype.fireEvent = function(evt, obj) {
	if (typeof this.config.custom_callbacks[evt] == 'function') {
		return this.config.custom_callbacks[evt](obj);
	}
};


/**
 *	To set area dimensions.
 *	This is needed to achieve the same result in all browsers.
 *	@author	adam
 *	@date	10-12-2007 22:29:41
 *	@param	id	The id of the area (canvas) to resize.
 *	@param	w	The desired width in pixels.
 *	@param	h	The desired height in pixels.
 */
imgmap.prototype.setAreaSize = function(id, w, h) {
	if (id === null) {id = this.currentid;}
	var area = this.areas[id];
	if (w !== null) {
		area.width  = w;
		area.style.width  = (w) + 'px';
		area.setAttribute('width',  w);
	}
	if (h !== null) {
		area.height = h;
		area.style.height = (h) + 'px';
		area.setAttribute('height', h);
	}
};


/**
 *	Tries to detect preferred language of user.
 *	@date	2007.12.28. 15:43:46
 *	@return The two byte language code. (We dont care now for pt-br, etc.)
 */
imgmap.prototype.detectLanguage = function() {
	var lang;
	if (navigator.userLanguage) {
		lang = navigator.userLanguage.toLowerCase();
	}
	else if (navigator.language) {
		lang = navigator.language.toLowerCase();
	}
	else {
		return this.config.defaultLang;
	}
	if (lang.length >= 2) {
		lang = lang.substring(0,2);
		return lang;
	}
	return this.config.defaultLang;
};


/**
 *	Disable selection on a given object.
 *	This is especially useful in Safari, where dragging around areas
 *	keeps selecting all sorts of things.
 *	@author	Bret Taylor
 *	@url	http://ajaxcookbook.org/disable-text-selection/
 *	@date	27-07-2008 1:57:45
 *	@param	element	The DOM element on which you want to disable selection.
 */
imgmap.prototype.disableSelection = function(element) {
	if (typeof element == 'undefined' || !element) {return false;}
	if (typeof element.onselectstart != "undefined") {
	    element.onselectstart = function() {
	        return false;
	    };
    }
    if (typeof element.unselectable != "undefined") {
    	element.unselectable = "on";
    }
    if (typeof element.style.MozUserSelect != "undefined") {
    	element.style.MozUserSelect = "none";
    }
};


/**
 *	@date	11-02-2007 19:57:05
 *	@url	http://www.deepwood.net/writing/method-references.html.utf8
 *	@author	Daniel Brockman
 *	@addon
 */
Function.prototype.bind = function(object) {
	var method = this;
	return function () {
		return method.apply(object, arguments);
	};
};


/**
 *	Trims a string.
 *	Changed not to extend String but use own function for better compatibility.
 *	@param str The string to trim.
 */
imgmap.prototype.trim = function(str) {
	return str.replace(/^\s+|\s+$/g, '');
};


