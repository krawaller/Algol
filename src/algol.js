Algol = (function(){
	
	/**
	 * Flattens a list of arrays into a single array
	 * Used by tester
	 * @param {Array} Array of arrays to flatten
	 * @return {Array} Single array
	 */
	Array.flatten = function(arrs){
		ret = [];
		arrs.map(function(arr){
			ret = ret.concat(arr);
		});
		return ret;
	};
	
	/**
	 * Merges all given objects, property precedence from left
	 * Used throughout
	 * @param {Object} ...   Objects to merge
	 * @return Merged object 
	 */
	Object.merge = function(){
    	if (!arguments[0]){
	        arguments[0] = {};
	    }
	    if (!arguments[1]){
        	arguments[1] = {};
    	}
    	for (var property in arguments[1]) {
	        if (!arguments[0].hasOwnProperty(property)){ arguments[0][property] = arguments[1][property]; }
	    }
	    Array.prototype.splice.call(arguments,1,1);
	    return arguments.length === 1 ? arguments[0] : Object.merge.apply(0,arguments);
	};
	
	/**
	 * Calculates property state at a given time according to startvalue and changes
	 * @param {Number|String} startvalue
	 * @param {Array} changes List of changes, each change is [step,value]
	 * @param {Number} step
	 * @return {Number|String} Value at given time
	 */
	function calcPropertyValue(startvalue,changes,step){
		if (!changes){
			return startvalue;
		}
		if (!step){
			return changes[changes.length-1][1];
		}
		if (step < changes[0][0]){
			return startvalue;
		}
		for(var i = changes.length-1;i>-1;i--){
			if (changes[i][0]<= step){
				return changes[i][1];
			}
		}
	}
	
	/**
	 * Calculates startvalues and changes for a single object into a given time state
	 * Used only by calcCollection
	 * @param {Object} startproperties Starting object
	 * @param {Object} changes Per property changes
	 * @param {Number} step Which step to calculate to
	 * @return {Object} Stepstate object
	 */
	function calcObject(startproperties,changes,step){
		if (!changes){
			return startproperties;
		}
		var ret = {}, val;
		for(var p in startproperties){
			ret[p] = calcPropertyValue(startproperties[p],changes[p],step);
		}
		for(p in changes){
			if (!ret.hasOwnProperty(p)){
				val = calcPropertyValue(startproperties[p],changes[p],step);
				if (val !== undefined){
					ret[p] = val;
				}
			}
		}
		return ret;
	}
	
	/**
	 * Takes a set of startvalues and changes, and calculates state for a given time
	 * Used by cauldron filler
	 * @param {Object} startset Object with starting conditions
	 * @param {Object} changeset Object with changes per property per object
	 * @param {Number} step Which step to calculate to 
	 * @return {Object} Object with calculated objects 
	 */
	function calcCollection(startset,changeset,step){
		if (!changeset){
			return startset;
		}
		var ret = {};
		for(var p in startset){
			ret[p] = calcObject(startset[p],changeset[p],step);
		}
		for(p in changeset){
			if (!ret.hasOwnProperty(p)){
				ret[p] = calcObject(startset[p],changeset[p],step);
			}
		}
		return ret;
	}
	
	/**
	 * Calculates new square according to directions
	 * Used by artifactgenerator utility functions
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} dir
	 * @param {Number} forward
	 * @param {Number} right
	 * @return {Object} The new position
	 */
	function moveInDir(x,y,dir,forward,right){
		switch(dir){
			case 2: 
			    return {x: x+forward+right, y: y-forward+right};
			case 3: 
				return {x: x+forward, y: y+right};
			case 4:
				return {x: x+forward-right, y: y+forward+right};
			case 5: 
				return {x: x-right, y: y+forward};
			case 6:
				return {x: x-forward-right, y: y+forward-right};
			case 7:
				return {x: x-forward, y: y-right};
			case 8: 
				return {x: x-forward+right, y: y-forward-right};
			default:
				return {x: x+right, y: y-forward};
		}
	}
	
	/**
	 * Tests whether or not a given squares is within board bounds
	 * Used by artifactgenerator utility functions
	 * @param {Object} pos Coordinates of position to test
	 * @param {Object} boarddims Object of board dimensions (and maybe kind)
	 * @return {Boolean} whether or not the position is within bounds
	 */
	function isOnBoard(pos,boarddims){
		return pos.x > 0 && pos.x <= boarddims.x && pos.y>0 && pos.y <= boarddims.y;
	}
	
	/**
	 * Calculates what a direction is in relation to another direction
	 * Used by artifactgenerator utility functions
	 * @param {Number} dir The current direction
	 * @param {Number} relativeto The direction it should be relative to
	 * @return {Number} The newly calculated direction
	 */
	function dirRelativeTo(dir,relativeto){
		return [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8][relativeto-2+dir];
	}
	
	/**
	 * Offset main utility function
	 * Called only from doOffset function
	 * @param {Object} def Offset definition object from game 
	 * @param {Array} starts Testerresultlist of matching squares
	 * @param {Object} boarddims Object with board dimensions (and maybe kind)
	 * @return {Array} list of created artifacts
	 */
	function offset(def,starts,boarddims){
		var start,ret = {}, mould = {
			artifact: "offset",
			aid: def.aid
		};
		def.dirs = def.dirs || [1];
		for(var ykx in starts){
			start = starts[ykx];
			(def.dirs || [1]).map(function(dir){
				if (def.relative && start.dir){ // TODO - only if this is a number and not array! :P
					dir = dirRelativeTo(dir,start.dir);
				}
				var newpos = moveInDir(start.x,start.y,dir,def.forward,def.right), sqr;
				if (isOnBoard(newpos,boarddims)){
					ret[YKX(newpos)] = Object.merge({artifactdir:dir},newpos,mould,start);
				}
			});
		};
		return ret;
	}
	
	/**
	 * Spawn main utility function
	 * Called only from doSpawn function
	 * @param {Object} def Definition object from game
	 * @param {Object} where Testerresult of matching squares
	 * @return {Object} list Object with created artifacts
	 */
	function spawn(def,where){
		var ret = {}, mould = {
			artifact: "spawn",
			aid: def.aid
		};
		for(var ykx in where){
			ret[ykx] = Object.merge(mould,where[ykx]);
		}
		return ret;
	}
	
	/**
	 * Walker main utility function
	 * Called only from doWalker function
	 * @param {Object} def Definition object from game
	 * @param {Array} starts Testerresultlist of matching squares
	 * @param {Array} stops Testerresultlist of matching squares
	 * @param {Object} boarddims Object with board dimensions (and maybe kind)
	 * @param {Array} steps Optional Testerresultlist of matching squares 
	 * @return {Array} list Array of created artifacts
	 */
	function walker(def,starts,stops,boarddims,steps){
		var ret = {}, o, start;
		for(var startykx in starts){
			start = starts[startykx];
			(def.dirs || [1]).map(function(dir){
				if (def.relative && start.dir){
					dir = dirRelativeTo(dir,start.dir);
				}
				var steppos = moveInDir(start.x,start.y,dir,1,0), stepykx = YKX(steppos), step = 1;
				while(isOnBoard(steppos,boarddims) && step<=(def.max || 66666) && (!steps || steps[stepykx])){
					if (stops[stepykx]){ // we hit a stop!
						if (def.createatstop) {
							o = {
								x: steppos.x,
								y: steppos.y,
								aid: def.aid,
								artifactdir: dir,
								artifact: "walkstop"
							};
							o = Object.merge(o,start); // steal collected stuff from startsquare (uid,etc)
							ret[stepykx] = o;
						}
						return;
					}
					if (def.createatstep){
						o = {
							x: steppos.x,
							y: steppos.y,
							aid: def.aid,
							artifact: "walkstep",
							artifactdir: dir,
							step: step
						};
						o = Object.merge(o,start); // steal collected stuff from startsquare (uid,etc)
						ret[stepykx] = o;
					}
					steppos = moveInDir(steppos.x,steppos.y,dir,1,0);
					stepykx = YKX(steppos);
					step++; 
				}
			});
		};
		return ret;
	}
	
	/**
	 * Melds 2 objects together. If common prop with different value, makes array.
	 * @param {Object} o1
	 * @param {Object} o2
	 * @return {Object} Melded object
	 */
	function meldObjects(o1,o2){
		var ret = {};
		[o1,o2].map(function(o){
			for(var p in o){
				if (ret.hasOwnProperty(p) && ret[p] !== o[p]) {
					ret[p] = [].concat(ret[p]).concat(o[p]);
				}
				else {
					ret[p] = o[p];
				}
			}
		});
		return ret;
	}
	
	/**
	 * Walks through a list of objects and returns matches to property obj
	 * Used by tester and artifact functions
	 * @param {Object} cauldron
	 * @param {Object} query
	 * @param {Object} vars
	 * @return {Object} Object with per-ykx-melded objects
	 */
	function querier(cauldron,query,vars){
		var ret = {}, bowl = cauldron[query.from] || cauldron, props = query.props, found, meld;
		for(var ykx in bowl){
			found = false;
			meld = {};
			(Array.isArray(bowl[ykx]) ? bowl[ykx] : [bowl[ykx]]).map(function(o){
				for (var p in props) {
					var ok = ((o[p] == props[p]) || (vars && vars.hasOwnProperty(props[p]) && vars[props[p]] == o[p]));
					if (!ok && Array.isArray(props[p])) {
						if (vars){
							for(var v in vars){
								props[p].push(vars[v]);
							}
						}
						ok = props[p].indexOf(o[p]) !== -1;
					}
					//console.log(p,props[p],o[p],ok,vars,vars ? vars.hasOwnProperty(props[p]) : false);
					if (!ok) {
						return;
					}
				}
				if (ok){
					meld = found ? Algol.utils.meldObjects(meld,o) : o;
					found = true;
				}
			});
			if (found){
				ret[ykx] = meld;
			}
		}
		return ret;
	}
	
	
	/**
	 * Walks through the array of query results, and sees which pos are present in every result
	 * Used in tester
	 * @param {Object} array of queryresult objects
	 * @return {Object} object with melded objects for all common ykx
	 */
	function findCommonPos(list){
		var hits = list.pop();
		list.map(function(res){
			for(var ykx in hits){
				if (res.hasOwnProperty(ykx)){
					hits[ykx] = meldObjects(hits[ykx],res[ykx]);
				}
				else {
					delete hits[ykx];
				}
			}
		});
		return hits;
	}
	
	/**
	 * Used to execute tests from various sources
	 * @param {Object} cauldron
	 * @param {Object} test
	 * @param {Object} vars
	 * @return {Object} resultobject
	 */
	function tester(cauldron,test,vars){
		// complex test, run through list
		var results = [], ret, except;
		if (test.tests){
			test.tests.map(function(t){
				results.push(tester(cauldron,t,vars));
			});
			ret = findCommonPos(results);
			if (test.except){
				except = tester(cauldron,test.except,vars);
				for(var ykx in except){
					delete ret[ykx];
				}
			}
			return ret;
		}
		// single query, perform and return result
		return querier(cauldron,test,vars);
	}

	
	function YKX(o){
		return o.y*1000+o.x;
	}
	
	/**
	 * Fully calculates the Units object for a given step
	 * Used only by getCauldron
	 * @param {Object} setup The initial setup
	 * @param {Object} unitstates Unit changes
	 * @param {Object} unitmoulds Optional moulds def
	 * @param {Number} step The step to calculate to
	 * @return {Object} An object of augmented unit objs
	 */
	function getUnitBowl(setup,unitstates,unitmoulds,step){
		var units = calcCollection(setup,unitstates,step), ret = {};
		
		for(var uid in units){
			var unit = units[uid], ykx = YKX(unit);
			if (unitmoulds && unit.unit && unitmoulds[unit.unit]){
				units[uid] = Object.merge(unit,unitmoulds[unit.unit]);
			}
			if (!ret[ykx]){
				ret[ykx] = [];
			}
			ret[ykx].push(unit);
		}
		return ret;
	}
	
	/**
	 * Fully calculates the terrain bowl for a given step
	 * @param {Object} terrain The initial setup
	 * @param {Object} shifts Terrain changes
	 * @param {Object} terrainmoulds Optional moulds def
	 * @param {Number} step The step to calculate to 
	 */
	function getTerrainBowl(terrain,shifts,terrainmoulds,step){
		var sqrs = calcCollection(terrain,shifts,step);
		for(var ykx in sqrs){
			var sqr = sqrs[ykx];
			if (terrainmoulds && sqr.terrain && terrainmoulds[sqr.terrain]){
				sqrs[ykx] = Object.merge(sqr,terrainmoulds[sqr.terrain]);
			}
		}
		return sqrs;
	}
	
	
	// Expose
	return {
		utils: {
			moveInDir: moveInDir,
			dirRelativeTo: dirRelativeTo,
			meldObjects: meldObjects
		},
		time: {
			calcPropertyValue: calcPropertyValue,
			calcObject: calcObject,
			calcCollection: calcCollection
		},
		cauldron: {
			querier: querier,
			tester: tester,
			getUnitBowl: getUnitBowl,
			getTerrainBowl: getTerrainBowl
		},
		artifact: {
			offset: offset,
			walker: walker,
			spawn: spawn
		}
	};
})();
	