(function () {
	var mainMap = [],
	    startPoint = {},
	    endPoint = {},
	    demoMode = false,
	    maxAttempts = 150,
	    seed = 0.22222,
	    width = 100,
	    height = 50,
	    waveDemoDelay = 10,
	    editorFlag = true,
	    mapPlaceholder = $('#mapPlaceholder'),
	    initializeMap = function (map, sp, ep) {
	    	var x, y, xMax = width, yMax = height;
	    	for (x = 0; x < xMax; x += 1) {
	    		map[x] = [];
	    		for (y = 0; y < yMax; y += 1) {
	    			map[x][y] = (Math.random() > (1 - seed)) ? -1 : 0;
	    		}
	    	}
	    	do {
	    		sp = getRandomPoint(sp, xMax, yMax);
	    		ep = getRandomPoint(ep, xMax, yMax);
	    	} while (map[sp.x][sp.y] != 0 || map[ep.x][ep.y] != 0 || (sp.x == ep.x && sp.y == ep.y))
	    },
	    cloneMap = function (map) {
	    	var mapClone = [], x, y;
	    	for (x = 0; x < map.length; x += 1) {
	    		mapClone[x] = [];
	    		for (y = 0; y < map[0].length; y += 1) {
	    			mapClone[x][y] = map[x][y];
	    		}
	    	}
	    	return mapClone;
	    },
	    getRandomPoint = function (point, maxX, maxY) {
	    	point.x = Math.round(Math.random() * (maxX - 1));
	    	point.y = Math.round(Math.random() * (maxY - 1));
	    	return point;
	    },
	    printMap = function (map, element, route) {
	    	var resultHtml = '<div>', x, y, className = '';
	    	for (x = 0; x < map.length; x += 1) {
	    		resultHtml += '<div>';
	    		var mapRow = map[x];
	    		for (y = 0; y < mapRow.length; y += 1) {
	    			className = '';
	    			resultHtml += '<div ';
	    			if (x == startPoint.x && y == startPoint.y) {
	    				resultHtml += 'class=start';
	    			}
	    			else if (x == endPoint.x && y == endPoint.y) {
	    				resultHtml += 'class=end';
	    			}
	    			else {
	    				if (typeof (route) != 'undefined') {
	    					for (var r = 0; r < route.length; r += 1) {
	    						if (route[r].x == x && route[r].y == y) {
	    							className = 'trace';
	    						}
	    					}
	    				}
	    				if (className == '') {
	    					if (mapRow[y] == 0) {
	    						className = 'pass';
	    					}
	    					else if (mapRow[y] < 0) {
	    						className = 'wall';
	    					}
	    					else {
	    						if (demoMode) {
	    							className = 'route';
	    						}
	    						else {
	    							className = 'pass';
	    						}
	    					}
	    				}
	    				resultHtml += 'class=' + className;
	    			}
	    			var content = demoMode ? mapRow[y] : '&nbsp';
	    			resultHtml += '>' + content + '</div>';
	    		}
	    		resultHtml += '</div>';
	    	}
	    	resultHtml += '</div>';
	    	element.html(resultHtml);
	    },
	    findRoute = function (map, sp, ep, callback) {
	    	var tmpMap = cloneMap(map),
	    	    isEndReached = false,
	    	    currentRouteLength = 0,
	    	    getProcessingRange = function (currentMap, algStartPoint, currentStepNumber) {
	    	    	var range = {};
	    	    	range.startX = algStartPoint.x - currentStepNumber;
	    	    	range.endX = algStartPoint.x + currentStepNumber;
	    	    	range.startY = algStartPoint.y - currentStepNumber;
	    	    	range.endY = algStartPoint.y + currentStepNumber;
	    	    	if (range.startX < 0) {
	    	    		range.startX = 0;
	    	    	}
	    	    	if (range.startY < 0) {
	    	    		range.startY = 0;
	    	    	}
	    	    	if (range.endX >= currentMap.length) {
	    	    		range.endX = currentMap.length - 1;
	    	    	}
	    	    	if (range.endY >= currentMap[0].length) {
	    	    		range.endY = currentMap[0].length - 1;
	    	    	}
	    	    	return range;
	    	    },
	    	    wave = function (m) {
	    	    	var nx, ny, notNilPoints = [], waveRange = getProcessingRange(m, sp, currentRouteLength + 1);
	    	    	for (nx = waveRange.startX; nx <= waveRange.endX; nx += 1) {
	    	    		for (ny = waveRange.startY; ny <= waveRange.endY; ny += 1) {
	    	    			if (m[nx][ny] > 0) {
	    	    				notNilPoints[notNilPoints.length] = { x: nx, y: ny };
	    	    			}
	    	    		}
	    	    	}
	    	    	for (var n = 0; n < notNilPoints.length; n += 1) {
	    	    		var x = notNilPoints[n].x, y = notNilPoints[n].y, points = [], p;
	    	    		points[0] = { x: x, y: y - 1 };
	    	    		points[1] = { x: x + 1, y: y };
	    	    		points[2] = { x: x, y: y + 1 };
	    	    		points[3] = { x: x - 1, y: y };
	    	    		for (p = 0; p < points.length; p += 1) {
	    	    			if (points[p].x >= 0 && points[p].x < m.length
		    	    			&& points[p].y >= 0 && points[p].y < m[0].length
			    	    			&& m[points[p].x][points[p].y] == 0) {
	    	    				m[points[p].x][points[p].y] = m[x][y] + 1;
	    	    				if (points[p].x == ep.x && points[p].y == ep.y) {
	    	    					isEndReached = true;
	    	    				}
	    	    			}
	    	    		}

	    	    	}

	    	    };
	    	tmpMap[sp.x][sp.y] = 1;
	    	var step = function () {
	    		wave(tmpMap);
	    		if (demoMode) {
	    			printMap(tmpMap, mapPlaceholder);
	    		}
	    		currentRouteLength += 1;
	    		if (!isEndReached && currentRouteLength < maxAttempts) {
	    			if (demoMode) { window.setTimeout(step, waveDemoDelay); }
	    			else { step(); }
	    		}
	    		else {
	    			callback(currentRouteLength, maxAttempts, tmpMap, sp, ep);
	    		}
	    	};
	    	step();
	    },
	    traceRouteBack = function (map, ep, sp) {
	    	var cx = ep.x, cy = ep.y, route = [], v = map[cx][cy], reachedStart = false, r, attempts = 0;
	    	route[0] = ep;
	    	while (!reachedStart && attempts < maxAttempts) {
	    		var points = [], p;
	    		points[0] = { x: cx, y: cy - 1 };
	    		points[1] = { x: cx + 1, y: cy };
	    		points[2] = { x: cx, y: cy + 1 };
	    		points[3] = { x: cx - 1, y: cy };
	    		for (p = 0; p < points.length; p += 1) {
	    			if (map[points[p].x][points[p].y] == v - 1) {
	    				route[route.length] = points[p];
	    				v -= 1;
	    				cx = points[p].x;
	    				cy = points[p].y;
	    				if (points[p].x == sp.x && points[p].y == sp.y) {
	    					reachedStart = true;
	    				}
	    			}
	    		}
	    		attempts += 1;
	    	}
	    	var finalRoute = [];
	    	for (r = route.length - 1; r >= 0; r -= 1) {
	    		finalRoute[finalRoute.length] = route[r];
	    	}
	    	return finalRoute;
	    },
	    findRouteCallback = function (routeLength, max, map, sp, ep) {
	    	var msg = routeLength, tracedRoute, routeFound = msg < max;
	    	msg = routeFound ? 'Route found. Route length: ' + msg : 'No route found';
	    	if (routeFound) {
	    		tracedRoute = traceRouteBack(map, ep, sp);
	    		printMap(map, mapPlaceholder, tracedRoute);
	    		if (demoMode) { alert(msg); }
	    	}
	    	else {
	    		alert(msg);
	    	}
	    };
	initializeMap(mainMap, startPoint, endPoint);
	printMap(mainMap, mapPlaceholder);
	mapPlaceholder.click(function () {
		var d = 15.999,
		    x = event.clientX / d,
		    y = (event.clientY - $(this).position().top) / d;
		x = Math.round(x) - 1;
		y = Math.round(y) - 1;
		var myPoint = editorFlag ? startPoint : endPoint;
		myPoint.x = x;
		myPoint.y = y;
		editorFlag = !editorFlag;
		if (!editorFlag) {
			printMap(mainMap, mapPlaceholder);
		}
		else {
			findRoute(mainMap, startPoint, endPoint, findRouteCallback);
		}
	});
	$('#findRoute').click(function () {
		findRoute(mainMap, startPoint, endPoint, findRouteCallback);
	});
})();