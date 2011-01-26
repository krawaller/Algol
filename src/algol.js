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
	
	function searchCauldron(cauldron,test,vars,excepting){
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
			var forbidden = searchCauldron(cauldron,test.except,vars,true), oklist = [];
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
	
	function collectPotentialMarks(markdefs,selectedmarks,artifacts){
		var ret = [],pos;
		for(var mid in markdefs){
			pos = {};
			var markdef = markdefs[mid], markreqmet = !markdef.requiremark, reqprop;
			if (markdef.requiremark){
				selectedmarks.map(function(o){
					if (o.mark = mid){
						markreqmet = true;
						if (markdef.requiresame){
							reqprop = o[markdef.requiresame];
						}
					}
				})
			}
			if (markreqmet){
				artifacts.map(function(a){
					if (a.mark == mid && (!markdef.requiresame || a[markdef.requiresame] == reqprop) && !pos[a.y*1000+a.x]){
						ret.push(a);
						pos[a.y*1000+a.x] = true;
					} 
				})
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
					test: {
						type: "AND",
						tests: ["opponentbase","MYUNITS"]
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
					queries: ["crowntarget", "OPPONENTS"]
				},
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
						{x:3,y:7,terrain:"castle"},{x:6,y:7,terrain:"castle"},{x:8,y:7,terrain:"castle"},{x:12,y:7,terrain:"castle"},{x:14,y:7,terrain:"castle"},{x:17,y:7,terrain:"castle"},
						{x:3,y:8,terrain:"castle"},{x:17,y:8,terrain:"castle"},
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
			testObjectProperties: testObjectProperties,
			testObject: testObject,
			filterList: filterList,
			calcPropertyValue: calcPropertyValue,
			calcObject: calcObject,
			calcCollection: calcCollection,
			moveInDir: moveInDir,
			dirRelativeTo: dirRelativeTo,
			searchCauldron: searchCauldron,
			findCommonPos: findCommonPos,
			collectPotentialMarks: collectPotentialMarks,
			collectPotentialCommands: collectPotentialCommands
		},
		artifact: {
			offset: offset,
			walker: walker,
			spawn: spawn
		}
	};
})();
	