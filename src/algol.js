Algol = (function(){
	
	Array.filter = function(arr,filter){
		var ret = [];
		for(var i=0,l=arr.length;i<l;i++){
			if (arr[i]!==filter){
				ret.push(arr[i]);
			}
		}
		return ret;
	};
	
	Array.flatten = function(arrs){
		ret = [];
		arrs.map(function(arr){
			ret = ret.concat(arr);
		});
		return ret;
	};
	
	Array.unique = function(arr){
		var ret = [];
		for(var i=0,l=arr.length;i<l;i++){
			if (ret.indexOf(arr[i])===-1){
				ret.push(arr[i]);
			}
		}
		return ret;
	};
	
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
	
	function testObjectProperties(obj,props,vars){
		for(var p in props){
			if (obj[p] !== props[p] && (!props[p].indexOf || props[p].indexOf(obj[p]) == -1 ) && (!vars || vars[props[p]] !== obj[p])){
				return false;
			}
		}
		return true;
	};
	
    function testObject(obj,test,vars){
		switch(test.type){
			case "PROPS":
				return testObjectProperties(obj,test.props,vars);
			case "AND": 
				for(var i=0,s=test.tests.length;i<s;i++){
					if (!testObject(obj,test.tests[i],vars)){
						return false;
					}
				}
				return true;
			case "OR": 
				for(var i=0,s=test.tests.length;i<s;i++){
					if (testObject(obj,test.tests[i],vars)){
						return true;
					}
				}
				return false;
			case "NOT":
				return !testObject(obj,test.test,vars);
			default: 
				return testObjectProperties(obj,test,vars);
		}
	}
	function filterList(list,test,vars,collect){
		var result = [];
		list.map(function(obj){
			if (testObject(obj,test,vars)){
				if (collect) {
					var o = {};
					collect.map(function(p){
						o[p] = obj[p];
					});
					result.push(o);
				}
				else {
					result.push(obj);
				}
			}
		});
		return result;
	}
	
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
	
	function calcObject(startproperties,changes,step){
		if (!changes){
			return startproperties;
		}
		var ret = {};
		for(var p in startproperties){
			ret[p] = calcPropertyValue(startproperties[p],changes[p],step);
		}
		for(p in changes){
			if (!ret.hasOwnProperty(p)){
				ret[p] = calcPropertyValue(startproperties[p],changes[p],step);
			}
		}
		return ret;
	}
	
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
	
	function isOnBoard(pos,boarddims){
		return pos.x > 0 && pos.x <= boarddims.x && pos.y>0 && pos.y <= boarddims.y;
	}
	
	function dirRelativeTo(dir,relativeto){
		return [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8][relativeto-2+dir];
	}
	
	function offset(def,starts,boarddims){
		var ret = [];
		def.dirs = def.dirs || [1];
		starts.map(function(start){
			(def.dirs || [1]).map(function(dir){
				if (def.relative && start.dir){
					dir = dirRelativeTo(dir,start.dir);
				}
				var newpos = moveInDir(start.x,start.y,dir,def.forward,def.right), sqr;
				if (isOnBoard(newpos,boarddims)){
					sqr = {
						x: newpos.x,
						y: newpos.y,
						aid: def.aid,
						dir:dir,
						artifact: "offset"
					};
					sqr = Object.merge(sqr,start); // steal collected stuff from startsquare (uid,etc)
					if (def.hasOwnProperty("mark")){
						sqr.mark = def.mark;
					}
					if (def.hasOwnProperty("tag")){
						sqr.tag = def.tag;
					}
					ret.push(sqr);
				}
			});
		});
		return ret;
	}
	
	function walker(def,starts,stops,boarddims,steps){
		var ret = [], o;
		starts.map(function(start){
			(def.dirs || [1]).map(function(dir){
				if (def.relative && start.dir){
					dir = dirRelativeTo(dir,start.dir);
				}
				var steppos = moveInDir(start.x,start.y,dir,1,0), step = 1;
				while(isOnBoard(steppos,boarddims) && step<=(def.max || 66666) && (!steps || filterList(steps,{type:"PROPS",props:{x:steppos.x,y:steppos.y}}).length)){
					if (filterList(stops,{type:"PROPS",props:{x:steppos.x,y:steppos.y}}).length){
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
	
	function findCommonPos(lists){
		var ret = [], found = false;
		lists.sort(function(l1,l2){
			return l1.length-l2.length;
		});
		lists[0].map(function(pos){
			if (filterList(ret, {x: pos.x, y: pos.y }).length == 0) { // not already collected
				for (var i = 1; i < lists.length; i++) {
					found = false;
					for (var p = 0; p < lists[i].length; p++) {
						if (lists[i][p].x == pos.x || lists[i][p].y == pos.y) {
							found = true;
							pos = Object.merge(pos,lists[i][p]);
							p = lists[i].length;
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
	
	function searchCauldron(cauldron,test,excepting,vars){
		var ret = [], list, lists = [], copy = ["x","y"];
		switch(test.type){
			case "AND":
			case "OR":
				test.tests.map(function(t){
					lists.push(filterList(cauldron[t.from],t.props,vars,copy.concat(t.collect || [])));
				});
				list = test.type == "AND" ? findCommonPos(lists) : uniqueSquares(Array.flatten(lists));
				break;
			default:
				list = filterList(cauldron[test.from],{type:"PROPS",props:test.props},vars,copy.concat(test.collect || []));
		}
		list.map(function(o){
			ret.push(o);
		});
		if (test.except && !excepting){
			var forbidden = searchCauldron(cauldron,test.except,true), oklist = [];
			ret.map(function(l){
				var violating = false;
				forbidden.map(function(f){
					if (l.x == f.x && l.y == f.y){
						violating = true;
						return;
					}
				});
				if (!violating){
					oklist.push(l);
				}
			});
			ret = oklist;
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
						{x:1,y:1,type:"base",plr:1},{x:2,y:1,type:"base",plr:1},{x:3,y:1,type:"base",plr:1},{x:4,y:1,type:"base",plr:1},{x:5,y:1,type:"base",plr:1},{x:6,y:1,type:"base",plr:1},{x:7,y:1,type:"base",plr:1},{x:8,y:1,type:"base",plr:1},
						{x:1,y:8,type:"base",plr:2},{x:2,y:8,type:"base",plr:2},{x:3,y:8,type:"base",plr:2},{x:4,y:8,type:"base",plr:2},{x:5,y:8,type:"base",plr:2},{x:6,y:8,type:"base",plr:2},{x:7,y:8,type:"base",plr:2},{x:8,y:8,type:"base",plr:2}
					]
				}
			},
			setups: {
				standard: {
					1: {x:4,y:1,plr:1,type:"crown"},
					2: {x:5,y:1,plr:1,type:"crown"},
					3: {x:3,y:2,plr:1,type:"dagger"},
					4: {x:4,y:2,plr:1,type:"dagger"},
					5: {x:5,y:2,plr:1,type:"dagger"},
					6: {x:6,y:2,plr:1,type:"dagger"},
					7: {x:3,y:8,plr:2,type:"crown"},
					8: {x:6,y:8,plr:2,type:"crown"},
					9: {x:2,y:7,plr:2,type:"dagger"},
					10: {x:3,y:7,plr:2,type:"dagger"},
					11: {x:4,y:7,plr:2,type:"dagger"},
					12: {x:5,y:7,plr:2,type:"dagger"},
					13: {x:6,y:7,plr:2,type:"dagger"},
					14: {x:7,y:7,plr:2,type:"dagger"},
					15: {x:3,y:6,plr:2,type:"dagger"},
					16: {x:6,y:6,plr:2,type:"dagger"}
				}
			},
			winconditions: {
				counts: [{
					ifnot: 0,
					test: {
						from: "units",
						props: {
							type: "crown",
							plr: "OPPONENT",
							status: "dead"
						}
					},
					description: "You killed an opponent Crown!"
				},{
					ifnot: 0,
					test: {
						type: "AND",
						tests: [{
							from: "terrain",
							props: {
								type: "base",
								plr: "OPPONENT"
							}
						},{
							from: "units",
							props: {
								plr: "CURRENTPLAYER"
							}
						}]
					},
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
			actionpointsperturn: 1,
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
					starts: {from:"units",props:{type:"crown",plr:"CURRENTPLAYER"}},
				/*	starts: {
						type: "AND",
						tests: [{
							from: "marks",
							props: {
								type: "select"
							}
						},{
							from: "units",
							props: {type: "crown"}
						}]
					},*/
					stops: {from:"units",props:{}}
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
					starts: {from:"units",props:{type:"dagger",plr:"CURRENTPLAYER"}},
					stops: {from:"units",props:{}}
				},
				belowdagger: {
					type: "walker",
					aid: "belowdagger",
					dirs: [4,5,6],
					createatstop: true,
					createatstep: true,
					stoptag: "daggertarget",
					stepmark: "move",
					starts: {from:"units",props:{type:"dagger",plr:"CURRENTPLAYER"}},
					stops: {from:"units",props:{}}
				},
				daggerdiagkill: {
					type: "spawn",
					aid: "daggerdiagkill",
					mark: "kill",
					test: {
						type: "AND",
						tests: [{
							from: "artifacts",
							props: {
								tag: "daggertarget",
								dir: [2,4,6,8]
							}
						},{
							from: "units",
							props: {
								plr: "OPPONENT"
							}
						}]
					}
				},
				myunits: {
					type: "spawn",
					aid: "myunits",
					mark: "select",
					test: {
						from: "units",
						props: {
							plr: "CURRENTPLAYER"
						}
					}
				},
				daggercolumnkill: {
					type: "spawn",
					aid: "daggercolumnkill",
					mark: "kill",
					test: {
						type: "AND",
						tests: [{
							from: "artifacts",
							props: {
								tag: "daggertarget",
								dir: [2,4,6,8]
							}
						},{
							from: "units",
							props: {
								plr: "OPPONENT",
								type: "crown"
							}
						}]
					}
				},
				crownkill: {
					type: "spawn",
					aid: "crownkill",
					mark: "kill",
					test: {
						type: "AND",
						tests: [{
							from: "artifacts",
							props: {
								tag: "crowntarget"
							}
						},{
							from: "units",
							props: {
								plr: "OPPONENT"
							}
						}]
					}
				}
			}
		}
	};
	
	// Expose
	return {
		utils: {
			testObjectProperties: testObjectProperties,
			testObject: testObject,
			filterList: filterList,
			calcPropertyValue: calcPropertyValue,
			calcObject: calcObject,
			calcCollection: calcCollection,
			moveInDir: moveInDir,
			dirRelativeTo: dirRelativeTo,
			searchCauldron: searchCauldron,
			findCommonPos: findCommonPos
		},
		artifact: {
			offset: offset,
			walker: walker
		}
	};
})();
	