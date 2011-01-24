Algol = (function(){
	var testObjectProperties = function(obj,props){
		for(var p in props){
			if (obj[p] !== props[p]){
				return false;
			}
		}
		return true;
	};
    var testObject = function(obj,test){
		switch(test.type){
			case "PROPS":
				return testObjectProperties(obj,test.props);
			case "AND": 
				for(var i=0,s=test.tests.length;i<s;i++){
					if (!testObject(obj,test.tests[i])){
						return false;
					}
				}
				return true;
			case "OR": 
				for(var i=0,s=test.tests.length;i<s;i++){
					if (testObject(obj,test.tests[i])){
						return true;
					}
				}
				return false;
			case "NOT":
				return !testObject(obj,test.test);
			default: 
				return testObjectProperties(obj,test);
		}
	};
	var filterList = function(list,test){
		var result = [];
		list.map(function(obj){
			if (testObject(obj,test)){
				result.push(obj);
			}
		});
		return result;
	};
	
	var calcPropertyValue = function(startvalue,changes,step){
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
	};
	
	var calcObject = function(startproperties,changes,step){
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
	};
	
	var calcCollection = function(startset,changeset,step){
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
	};
	
	var moveInDir = function(x,y,dir,forward,right){
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
	};
	
	var isOnBoard = function(pos,boarddims){
		return pos.x > 0 && pos.x <= boarddims.x && pos.y>0 && pos.y <= boarddims.y;
	};
	
	var dirRelativeTo = function(dir,relativeto){
		var res = [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8][relativeto-2+dir];
		console.log("Dir "+dir+" relative to "+relativeto+" is "+res);
		return res;
	};
	
	var offset = function(def,starts,boarddims){
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
						type: def.create
					};
					if (start.hasOwnProperty("uid")){
						sqr.uid = start.uid;
					}
					ret.push(sqr);
				}
			});
		});
		return ret;
	};
	
	var walker = function(def,starts,stops,boarddims){
		var ret = [], o;
		starts.map(function(start){
			(def.dirs ||Ê[1]).map(function(dir){
				if (def.relative && start.dir){
					dir = dirRelativeTo(dir,start.dir);
				}
				var steppos = moveInDir(start.x,start.y,dir,1,0), step = 0;
				while(isOnBoard(steppos,boarddims)){
					step++; 
					if (filterList(stops,{type:"PROPS",props:{x:steppos.x,y:steppos.y}}).length){
						if (def.createatstop) {
							o = {
								x: steppos.x,
								y: steppos.y,
								aid: def.aid,
								type: def.createatstop
							};
							if (start.hasOwnProperty("uid")){
								o.uid = start.uid;
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
							type: def.createatstep,
							step: step
						};
						if (start.hasOwnProperty("uid")){
							o.uid = start.uid;
						}
						ret.push(o);
					}
					steppos = moveInDir(steppos.x,steppos.y,dir,1,0);
				}
			});
		});
		return ret;
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
			dirRelativeTo: dirRelativeTo
		},
		artifact: {
			offset: offset,
			walker: walker
		}
	};
})();
	