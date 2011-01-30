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
		var ret = [], mould = {
			artifact: "offset",
			aid: def.aid
		};
		if (def.hasOwnProperty("mark")){
			mould.mark = def.mark;
		}
		if (def.hasOwnProperty("tag")){
			mould.tag = def.tag;
		}
		def.dirs = def.dirs || [1];
		starts.map(function(start){
			(def.dirs || [1]).map(function(dir){
				if (def.relative && start.dir){
					dir = dirRelativeTo(dir,start.dir);
				}
				var newpos = moveInDir(start.x,start.y,dir,def.forward,def.right), sqr;
				if (isOnBoard(newpos,boarddims)){
					ret.push(Object.merge({dir:dir},newpos,mould,start));
				}
			});
		});
		return ret;
	}
	
	/**
	 * Spawn main utility function
	 * Called only from doSpawn function
	 * @param {Object} def Definition object from game
	 * @param {Array} where Testerresultlist of matching squares
	 * @return {Array} list of created artifacts 
	 */
	function spawn(def,where){
		var ret = [], mould = {
			artifact: "spawn",
			aid: def.aid
		};
		if(def.hasOwnProperty("tag")){
			mould.tag = def.tag;
		}
		if(def.hasOwnProperty("mark")){
			mould.mark = def.mark;
		}
		where.map(function(o){
			ret.push(Object.merge(o,mould));
		});
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
		var ret = [], o;
		starts.map(function(start){
			(def.dirs || [1]).map(function(dir){
				if (def.relative && start.dir){
					dir = dirRelativeTo(dir,start.dir);
				}
				var steppos = moveInDir(start.x,start.y,dir,1,0), step = 1;
				while(isOnBoard(steppos,boarddims) && step<=(def.max || 66666) && (!steps || querier(steps,{props:{x:steppos.x,y:steppos.y}}).length)){
					if (querier(stops,{props:{x:steppos.x,y:steppos.y}}).length){
						if (def.createatstop) {
							o = {
								x: steppos.x,
								y: steppos.y,
								aid: def.aid,
								dir: dir,
								artifact: "walkstop"
							};
							o = Object.merge(o,start); // steal collected stuff from startsquare (uid,etc)
							if (def.hasOwnProperty("stoptag")){
								o.tag = def.stoptag;
							}
							if (def.hasOwnProperty("stopmark")){
								o.mark = def.stopmark;
							}
							ret.push(o);
						}
						return;
					}
					if (def.createatstep){
						o = {
							x: steppos.x,
							y: steppos.y,
							aid: def.aid,
							artifact: "walkstep",
							dir: dir,
							step: step
						};
						o = Object.merge(o,start); // steal collected stuff from startsquare (uid,etc)
						if (def.hasOwnProperty("stepmark")){
							o.mark = def.stepmark;
						}
						if (def.hasOwnProperty("steptag")){
							o.tag = def.steptag;
						}
						ret.push(o);
					}
					steppos = moveInDir(steppos.x,steppos.y,dir,1,0);
					step++; 
				}
			});
		});
		return ret;
	}
	
	
	/**
	 * Finds all positions occuring in every list
	 * Used only in tester
	 * @param {Array} lists Array of arrays of objects
	 * @return Array of positions found in all lists
	 */
	function findCommonPos(lists){
		var ret = [], found = false, usedpos = {};
		lists.sort(function(l1,l2){
			return l1.length-l2.length;
		});
		lists[0].map(function(pos){
			if (!usedpos[pos.y*1000+pos.x]){ // TODO: figure out if this is really needed! 
				for (var i = 1; i < lists.length; i++) {
					found = false;
					for (var p = 0; p < lists[i].length; p++) {
						var c = lists[i][p];
						if (c.x == pos.x && c.y == pos.y) {
							found = true;
							usedpos[c.y*1000+c.x] = true;
							pos = Object.merge(pos,c);
							p = lists[i].length; // only need one hit per list
						}
					}
					if (!found){
						return;
					}
				}
				ret.push(pos);
			}
		});
		return ret;
	}
	
	/**
	 * merges all same-pos objects in a list, so only has unique positions
	 * Used only in Tester for OR-tests
	 * @param {Object} list 
	 * @return {Array} List of objects with unique positions
	 */
	function uniqueSquares(list){
		var sqrs = {}, ret = [];
		list.map(function(s){
			var sid = s.y*1000+s.x;
			if (!sqrs.hasOwnProperty(sid)){
				sqrs[sid] = {};
			}
			sqrs[sid] = Object.merge(sqrs[sid],s);
		});
		for(var s in sqrs){
			ret.push(sqrs[s]);
		}
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
	function querier2(cauldron,query,vars){
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
	 * Walks through a list of objects and returns matches to property obj
	 * Used by tester and artifact functions
	 * @param {Object} cauldron
	 * @param {Object} query
	 * @param {Object} vars
	 * @return {Array} Array of hits from correct cauldron bowl
	 */
	function querier(cauldron,query,vars){
		var ret = [], bowl = cauldron[query.from] || cauldron, props = query.props;
		bowl.map(function(o){
			for(var p in props){
				var ok = o[p] == props[p];
				if (!ok && props[p].constructor == Array){
					ok = props[p].indexOf(o[p]) !== -1; 
				}
				if (!ok && vars && vars.hasOwnProperty([props[p]])){
					ok = vars[props[p]] == o[p];
				}
				if (!ok){
					return;
				}
			}
			ret.push(o);
		});
		return ret;
	}
	
	/**
	 * Walks through the array of query results, and sees which pos are present in every result
	 * Used in tester2
	 * @param {Object} array of queryresult objects
	 * @return {Object} object with melded objects for all common ykx
	 */
	function findCommonPos2(list){
		var hits = list.pop(), found = false;
		list.map(function(res){
			for(var ykx in hits){
				if (res[ykx]){
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
	function tester2(cauldron,test,vars){
		// complex test, run through list
		var results = [], ret, except;
		if (test.tests){
			test.tests.map(function(t){
				results.push(tester2(cauldron,t,vars));
			});
			ret = findCommonPos2(results);
			if (test.except){
				except = tester2(cauldron,test.except,vars);
				for(var ykx in except){
					delete ret[ykx];
				}
			}
			return ret;
		}
		// single query, perform and return result
		return querier2(cauldron,test,vars);
	}
	
	/**
	 * Used to execute tests from various sources
	 * @param {Object} cauldron
	 * @param {Object} test
	 * @param {Object} vars
	 * @return {Array} list of objects fulfilling positions
	 */
	function tester(cauldron,test,vars){
		var lists = [], ret, ok = [], except;
		// complex test, run through list
		if (test.tests){
			test.tests.map(function(t){
				lists.push(tester(cauldron,t,vars));
			});
			ret = test.or ? uniqueSquares(Array.flatten(lists)) : findCommonPos(lists);
			if (test.except){
				except = tester(cauldron,test.except,vars);
				ret.map(function(o){
					if (!querier(except,{props:{x:o.x,y:o.y}}).length){
						ok.push(o);
					}
				});
				ret = ok;
			}
			return ret;
		}
		// single query, perform and return result
		return uniqueSquares(querier(cauldron,test,vars));
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
	
	function collectPotentialMarks(markdefs,selectedmarks,artifacts){
		var ret = [],pos;
		for(var mid in markdefs){
			pos = {};
			var markdef = markdefs[mid], markreqmet = !markdef.requiremark, reqprop;
			if (markdef.requiremark){
				selectedmarks.map(function(o){
					if (o.mark = mid){ // TODO - check this shit, is it real?
						markreqmet = true;
						if (markdef.requiresame){
							reqprop = o[markdef.requiresame];
						}
					}
				});
			}
			if (markreqmet){
				artifacts.map(function(a){
					if (a.mark == mid && (!markdef.requiresame || a[markdef.requiresame] == reqprop) && !pos[a.y*1000+a.x]){
						ret.push(a);
						pos[a.y*1000+a.x] = true;
					} 
				});
			}
		}
		return ret;
	}
	
	function collectPotentialCommands(cmnddefs,selectedmarks,artifacts){
		var ret = [], cmnddef, reqmet;
		for(var cid in cmnddefs){
			cmnddef = cmnddefs[cid];
			reqmet = !cmnddef.requiremark;
			if (cmnddef.requiremark){
				selectedmarks.map(function(o){
					if (o.mark == cmnddef.requiremark){
						reqmet = true;
					}
				});
			}
			if (reqmet){
				ret.push(cmnddef);
			}
		}
		return ret;
	}
	
	
	var games = {
		daggers: {
			boards: {
				standard: {
					height: 8,
					width: 8,
					terrain: [
						{x:1,y:1,terrain:"base",plr:1},{x:2,y:1,terrain:"base",plr:1},{x:3,y:1,terrain:"base",plr:1},{x:4,y:1,terrain:"base",plr:1},{x:5,y:1,terrain:"base",plr:1},{x:6,y:1,terrain:"base",plr:1},{x:7,y:1,terrain:"base",plr:1},{x:8,y:1,terrain:"base",plr:1},
						{x:1,y:8,terrain:"base",plr:2},{x:2,y:8,terrain:"base",plr:2},{x:3,y:8,terrain:"base",plr:2},{x:4,y:8,terrain:"base",plr:2},{x:5,y:8,terrain:"base",plr:2},{x:6,y:8,terrain:"base",plr:2},{x:7,y:8,terrain:"base",plr:2},{x:8,y:8,terrain:"base",plr:2}
					]
				}
			},
			setups: {
				standard: {
					1: {x:4,y:1,plr:1,unit:"crown"},
					2: {x:5,y:1,plr:1,unit:"crown"},
					3: {x:3,y:2,plr:1,unit:"dagger"},
					4: {x:4,y:2,plr:1,unit:"dagger"},
					5: {x:5,y:2,plr:1,unit:"dagger"},
					6: {x:6,y:2,plr:1,unit:"dagger"},
					7: {x:3,y:8,plr:2,unit:"crown"},
					8: {x:6,y:8,plr:2,unit:"crown"},
					9: {x:2,y:7,plr:2,unit:"dagger"},
					10: {x:3,y:7,plr:2,unit:"dagger"},
					11: {x:4,y:7,plr:2,unit:"dagger"},
					12: {x:5,y:7,plr:2,unit:"dagger"},
					13: {x:6,y:7,plr:2,unit:"dagger"},
					14: {x:7,y:7,plr:2,unit:"dagger"},
					15: {x:3,y:6,plr:2,unit:"dagger"},
					16: {x:6,y:6,plr:2,unit:"dagger"}
				}
			},
			winconditions: {
				counts: [{
					ifnot: 0,
					test: "deadopponentcrown",
					description: "You killed an opponent Crown!"
				},{
					ifnot: 0,
					test: "infiltratingunit",
					description: "You infiltrated the opponent camp!"
				}]
			},
			marks: {
				select: {
					clear: true,
					prio: 1
				},
				move: {
					prio: 2
				},
				kill: {
					prio: 3
				}
			},
			commands: {
				move: {
					mark: "move",
					targetmark: "select",
					movetomark: "move",
					actionpoints: 1
				},
				kill: {
					mark: "kill",
					targetmark: "kill",
					kill: true,
					actionpoints: 1
				}
			},
			endturnconditions:{
				actionpointsspent: 1
			},
			queries: {
				mycrowns: {from:"units",props:{unit:"crown",plr:"CURRENTPLAYER"}},
				mydaggers: {from:"units",props:{unit:"dagger",plr:"CURRENTPLAYER"}},
				opponentcrown: {
					from: "units",
					props: {
						plr: "OPPONENT",
						type: "crown"
					}
				},
				daggerdiagtarget: {
					from: "artifacts",
					props: {
						tag: "daggertarget",
						dir: [2, 4, 6, 8]
					}
				},
				daggerortotarget: {
					from: "artifacts",
					props: {
						tag: "daggertarget",
						dir: [1, 5]
					}
				},
				crowntarget: {
					from: "artifacts",
					props: {
						tag: "crowntarget"
					}
				},
				deadopponentcrown: {
					from: "units",
					props: {
						type: "crown",
						plr: "OPPONENT",
						status: "dead"
					}
				},
				opponentbase: {
					from: "terrain",
					props: {
						type: "base",
						plr: "OPPONENT"
					}
				},
			},
			tests: {
				daggerdiagkill: {
					type: "AND",
					queries: ["daggerdiagtarget", "OPPONENTUNITS"]
				},
				daggercolumnkill: {
					type: "AND",
					queries: ["daggerortotarget", "opponentcrown"]
				},
				crownkill: {
					type: "AND",
					queries: ["crowntarget", "OPPONENTUNITS"]
				},
				infiltratingunit: {
					type: "AND",
					tests: ["opponentbase", "MYUNITS"]
				}
			},
			artifactgenerators: {
				nexttocrown: {
					type: "walker",
					aid: "nexttocrown",
					dirs: [1,2,3,4,5,6,7,8],
					max: 1,
					createatstop: true,
					createatstep: true,
					stoptag: "crowntarget",
					stepmark: "move",
					starts: "mycrowns",
					stops: "ALLUNITS"
				},
				abovedagger: {
					type: "walker",
					aid: "abovedagger",
					dirs: [8,1,2],
					max: 1,
					createatstop: true,
					createatstep: true,
					stoptag: "daggertarget",
					stepmark: "move",
					starts: "mydaggers",
					stops: "ALLUNITS"
				},
				belowdagger: {
					type: "walker",
					aid: "belowdagger",
					dirs: [4,5,6],
					createatstop: true,
					createatstep: true,
					stoptag: "daggertarget",
					stepmark: "move",
					starts: "mydaggers",
					stops: "ALLUNITS"
				},
				daggerdiagkill: {
					type: "spawn",
					aid: "daggerdiagkill",
					mark: "kill",
					test: "daggerdiagkill"
				},
				myunits: { // TODO - allow marks to also have hardcoded shit like MYUNITS etc
					type: "spawn",
					aid: "myunits",
					mark: "select",
					test: "MYUNITS"
				},
				daggercolumnkill: {
					type: "spawn",
					aid: "daggercolumnkill",
					mark: "kill",
					test: "daggercolumnkill"
				},
				crownkill: {
					type: "spawn",
					aid: "crownkill",
					mark: "kill",
					test: "crownkill"
				}
			}
		},
		castle: {
			boards: {
				standard: {
					height: 19,
					width: 19,
					terrain: [
						{x:6,y:1,terrain:"castle"},{x:14,y:1,terrain:"castle"},
						{x:3,y:2,terrain:"castle"},{x:6,y:2,terrain:"castle"},{x:8,y:2,terrain:"castle"},{x:9,y:2,terrain:"castle"},{x:11,y:2,terrain:"castle"},{x:12,y:2,terrain:"castle"},{x:14,y:2,terrain:"castle"},{x:17,y:2,terrain:"castle"},
						{x:3,y:3,terrain:"castle"},{x:6,y:3,terrain:"castle"},{x:8,y:3,terrain:"castle"},{x:12,y:3,terrain:"castle"},{x:14,y:3,terrain:"castle"},{x:17,y:3,terrain:"castle"},
						{x:3,y:4,terrain:"castle"},{x:6,y:4,terrain:"castle"},{x:8,y:4,terrain:"castle"},{x:12,y:4,terrain:"castle"},{x:14,y:4,terrain:"castle"},{x:17,y:4,terrain:"castle"},
						{x:3,y:5,terrain:"castle"},{x:6,y:5,terrain:"castle"},{x:8,y:5,terrain:"castle"},{x:12,y:5,terrain:"castle"},{x:14,y:5,terrain:"castle"},{x:17,y:5,terrain:"castle"},
						{x:3,y:6,terrain:"castle"},{x:6,y:6,terrain:"castle"},{x:8,y:6,terrain:"castle"},{x:9,y:6,terrain:"castle"},{x:10,y:6,terrain:"castle"},{x:11,y:6,terrain:"castle"},{x:12,y:6,terrain:"castle"},{x:14,y:6,terrain:"castle"},{x:17,y:6,terrain:"castle"},
						{x:3,y:7,terrain:"castle"},{x:17,y:7,terrain:"castle"},
						{x:3,y:8,terrain:"castle"},{x:4,y:8,terrain:"castle"},{x:5,y:8,terrain:"castle"},{x:6,y:8,terrain:"castle"},{x:7,y:8,terrain:"castle"},{x:8,y:8,terrain:"castle"},{x:9,y:8,terrain:"castle"},{x:11,y:8,terrain:"castle"},{x:12,y:8,terrain:"castle"},{x:13,y:8,terrain:"castle"},{x:14,y:8,terrain:"castle"},{x:15,y:8,terrain:"castle"},{x:16,y:8,terrain:"castle"},{x:17,y:8,terrain:"castle"},
						{x:3,y:12,terrain:"castle"},{x:4,y:12,terrain:"castle"},{x:5,y:12,terrain:"castle"},{x:6,y:12,terrain:"castle"},{x:7,y:12,terrain:"castle"},{x:8,y:12,terrain:"castle"},{x:9,y:12,terrain:"castle"},{x:11,y:12,terrain:"castle"},{x:12,y:12,terrain:"castle"},{x:13,y:12,terrain:"castle"},{x:14,y:12,terrain:"castle"},{x:15,y:12,terrain:"castle"},{x:16,y:12,terrain:"castle"},{x:17,y:12,terrain:"castle"},
						{x:3,y:13,terrain:"castle"},{x:17,y:13,terrain:"castle"},
						{x:3,y:14,terrain:"castle"},{x:6,y:14,terrain:"castle"},{x:8,y:14,terrain:"castle"},{x:9,y:14,terrain:"castle"},{x:10,y:14,terrain:"castle"},{x:11,y:14,terrain:"castle"},{x:12,y:14,terrain:"castle"},{x:14,y:14,terrain:"castle"},{x:17,y:14,terrain:"castle"},
						{x:3,y:15,terrain:"castle"},{x:6,y:15,terrain:"castle"},{x:8,y:15,terrain:"castle"},{x:12,y:15,terrain:"castle"},{x:14,y:15,terrain:"castle"},{x:17,y:15,terrain:"castle"},
						{x:3,y:16,terrain:"castle"},{x:6,y:16,terrain:"castle"},{x:8,y:16,terrain:"castle"},{x:12,y:16,terrain:"castle"},{x:14,y:16,terrain:"castle"},{x:17,y:16,terrain:"castle"},
						{x:3,y:17,terrain:"castle"},{x:6,y:17,terrain:"castle"},{x:8,y:17,terrain:"castle"},{x:12,y:17,terrain:"castle"},{x:14,y:17,terrain:"castle"},{x:17,y:17,terrain:"castle"},
						{x:3,y:18,terrain:"castle"},{x:6,y:18,terrain:"castle"},{x:8,y:18,terrain:"castle"},{x:9,y:18,terrain:"castle"},{x:11,y:18,terrain:"castle"},{x:12,y:18,terrain:"castle"},{x:14,y:18,terrain:"castle"},{x:17,y:18,terrain:"castle"},
						{x:6,y:19,terrain:"castle"},{x:14,y:19,terrain:"castle"},
						{x:10,y:4,terrain:"throne",plr:1},
						{x:10,y:16,terrain:"throne",plr:2}
					]
				}
			},
			setups: {
				standard: {
					1: {x:6,y:1,plr:1,unit:"soldier"},
					2: {x:14,y:1,plr:1,unit:"soldier"},
					3: {x:8,y:2,plr:1,unit:"soldier"},
					4: {x:12,y:2,plr:1,unit:"soldier"},
					5: {x:8,y:6,plr:1,unit:"soldier"},
					6: {x:12,y:6,plr:1,unit:"soldier"},
					7: {x:3,y:8,plr:1,unit:"soldier"},
					8: {x:17,y:8,plr:1,unit:"soldier"},
					9: {x:6,y:19,plr:2,unit:"soldier"},
					10: {x:14,y:19,plr:2,unit:"soldier"},
					11: {x:8,y:18,plr:2,unit:"soldier"},
					12: {x:12,y:18,plr:2,unit:"soldier"},
					13: {x:8,y:14,plr:2,unit:"soldier"},
					14: {x:12,y:14,plr:2,unit:"soldier"},
					15: {x:3,y:12,plr:2,unit:"soldier"},
					16: {x:17,y:12,plr:2,unit:"soldier"}
				}
			},
			winconditions: {
				counts: [{
					ifnot: 0,
					test: "conqueringunit"
				}]
			},
			endturnconditions: {
				actionpointsspent: 1
			},
			marks: {
				select: {
					clear: true,
					prio: 1
				},
				move: {
					prio: 2
				},
				kill: {
					prio: 3
				}
			},
			commands: {
				move: {
					mark: "move",
					targetmark: "select",
					movetomark: "move",
					actionpoints: 1
				},
				kill: {
					mark: "kill",
					targetmark: "kill",
					kill: true,
					actionpoints: 1
				}
			},
			queries: {
				opponentthrone: {
					from: "terrain",
					props: {
						plr: "OPPONENT",
						terrain: "throne"
					}
				},
				castlewall: {
					from: "terrain",
					props: {
						terrain: "castle"
					}
				},
				anyterrain: {
					from: "terrain"
				},
				mythrone: {
					from: "terrain",
					props: {
						terrain: "throne",
						plr: "CURRENTPLAYER"
					}
				},
				inreach: {
					from: "artifacts",
					props: {
						tag: "reach"
					}
				},
				forbidden: {
					from: "artifacts",
					props: {
						tag: "forbidden"
					}
				}
			},
			tests: {
				conqueringunit: {
					type: "AND",
					tests: ["MYUNITS", "opponentthrone"]
				},
				mycastlewallunits: {
					type: "AND",
					tests: ["MYUNITS", "castlewall"]
				},
				mygroundunits: {
					type: "EXCEPT",
					test: "MYUNITS",
					except: "castlewall" // TODO: should actually be mycastlewall units! :) Nest tests?
				},
				groundblocks: {
					type: "OR",
					tests: ["ALLUNITS","anyterrain"]
				},
				nowalk: {
					type: "AND",
					tests: ["ALLUNITS", "mythrone"]
				},
				movetargets: {
					type: "EXCEPT",
					test: "inreach",
					except: "forbidden"
				},
				potentialtargets: {
					type: "AND",
					tests: ["inreach", "OPPONENTUNITS"]
				},
			},
			artifactgenerators: {
				wallslide: {
					type: "walker",
					aid: "wallslide",
					dirs: [1,3,5,7],
					createatstop: true,
					createatstep: true,
					stoptag: "reach",
					stepmark: "move",
					starts: "mycastlewallunits",
					steps: "castlewall",
					stops: "ALLUNITS"
				},
				groundslide: {
					type: "walker",
					aid: "wallslide",
					dirs: [1,3,5,7],
					createatstop: true,
					createatstep: true,
					stoptag: "reach",
					stepmark: "move",
					starts: "mygroundunits",
					stops: "groundblocks"
				},
				nexttounit: {
					type: "offset",
					aid: "nexttounit",
					dirs: [1,3,5,7],
					forward: 1,
					right: 0,
					tag: "reach",
					starts: "MYUNITS"
				},
				forbidden: {
					type: "spawn",
					aid: "forbidden",
					tag: "forbidden",
					test: "nowalk"
				},
				reachmove: {
					type: "spawn",
					aid: "reachmove",
					mark: "move",
					test: "movetargets"
				},
				kill: {
					type: "spawn",
					aid: "kill",
					mark: "kill",
					test: "potentialtargets"
				}
			}
		}
	};
	
	// Expose
	return {
		utils: {
			moveInDir: moveInDir,
			dirRelativeTo: dirRelativeTo,
			collectPotentialMarks: collectPotentialMarks,
			collectPotentialCommands: collectPotentialCommands,
			meldObjects: meldObjects
		},
		time: {
			calcPropertyValue: calcPropertyValue,
			calcObject: calcObject,
			calcCollection: calcCollection
		},
		cauldron: {
			findCommonPos: findCommonPos,
			tester: tester,
			querier: querier,
			querier2: querier2,
			tester2: tester2,
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
	