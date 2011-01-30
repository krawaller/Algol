TestCase("Algol namespace definition",{
	"test should be an object": function(){
		assertObject("should be defined",Algol);
	}
});

TestCase("CalcPropertyValue",{
	"test should be defined": function(){
		assertFunction(Algol.time.calcPropertyValue);
	},
	"test if no changes should just return start value": function(){
		assertEquals("a",Algol.time.calcPropertyValue("a"));
	},
	"test if no step, should return last value from the list": function(){
		assertEquals("d",Algol.time.calcPropertyValue("a",[[2,"b"],[3,"c"],[4,"d"]]));
	},
	"test if changes and step, should return correct value": function(){
		var changes = [[2,"b"],[4,"c"],[8,"d"]];
		assertEquals("d",Algol.time.calcPropertyValue("a",changes,10));
		assertEquals("c",Algol.time.calcPropertyValue("a",changes,4));
		assertEquals("b",Algol.time.calcPropertyValue("a",changes,3));
		assertEquals("a",Algol.time.calcPropertyValue("a",changes,1));
	}
});


TestCase("CalcObject",{
	"test should be defined": function(){
		assertFunction(Algol.time.calcObject);
	},
	"test if no changes, should just return startprops": function(){
		var startprops = {a:1,b:1,c:1},
			changes = undefined,
			step = undefined,
			res = Algol.time.calcObject(startprops,changes,step);
		assertEquals(startprops,res);
	},
	"test should return correct props": function(){
		var startprops = {A:"a",B:"b",C:"c"},
			changes = {
				A:[[1,"aa"],[3,"aaa"]],
				B:[[2,"bb"],[5,"bbb"]]
			},
			step = undefined,
			res = Algol.time.calcObject(startprops,changes,step);
		assertEquals({A:"aaa",B:"bbb",C:"c"},res);
	},
	"test should not include future prop if no state for given step": function(){
		var startprops = {A:"a",B:"b",C:"c"},
			changes = {
				A:[[1,"aa"],[3,"aaa"]],
				B:[[2,"bb"],[5,"bbb"]],
				E:[[10,"QQQ"]]
			},
			step = 4,
			res = Algol.time.calcObject(startprops,changes,step);
		assertEquals({A:"aaa",B:"bb",C:"c"},res);
	}
});

TestCase("calcCollection",{
	"test should be defined": function(){
		assertFunction(Algol.time.calcCollection);
	},
	"test if no changeset, should just return startset": function(){
		var startset = {
			u1: {A:"a",B:"b"},
			u2: {A:"-a",B:"-b"}
		},
		    changeset = undefined,
			step = undefined,
			res = Algol.time.calcCollection(startset,changeset,step);
		assertEquals(startset,res);
	},
	"test should return correct objs": function(){
		var startset = {
			u1: {A:"a",B:"b"},
			u2: {A:"-a",B:"-b"},
			u3: {A:"--a",B:"--b"}
		},
		changeset = {
			u1:	{A:[[2,"aa"],[4,"aaa"]]},
			u2: {A:[[2,"-aa"],[4,"-aaa"]]}
		},
			step = 3,
			res = Algol.time.calcCollection(startset,changeset,step),
			exp = {
				u1: {A:"aa",B:"b"},
				u2: {A:"-aa",B:"-b"},
				u3: startset.u3
			} ;
		assertEquals(res,exp);
	}
});

TestCase("Artifact Offset",{
	"test should be defined": function(){
		assertFunction(Algol.artifact.offset);
	},
	"test should return correct artifacts": function(){
		var definition, starts, boarddims = {x:7,y:5}, exp, res;
		definition = {
			forward: 2,
			right: 3,
			aid: "FOO"
		};
		starts = {
			3002: {
				x: 2,
				y: 3
			},
			4004: {
				x: 4,
				y: 4
			},
			2007: {
				x: 7,
				y: 2
			}
		};
		exp = {
			1005: {
				x: 5,
				y: 1,
				artifact: "offset",
				aid: "FOO",
				artifactdir: 1
			},
			2007: {
				x: 7,
				y: 2,
				artifact: "offset",
				aid: "FOO",
				artifactdir: 1
			}
		};
		res = Algol.artifact.offset(definition,starts,boarddims);
		assertEquals(exp,res);
	},
	"test generated artifacts should include stuff from startsquare": function(){
		var definition, starts, boarddims = {x:7,y:5}, exp, res;
		definition = {
			forward: 2,
			right: 3,
			aid: "FOO"
		};
		starts = {
			3002: {
				x: 2,
				y: 3,
				foo: "bar"
			},
			4004: {
				x: 4,
				y: 4,
				bar: "baz"
			},
			2007: {
				x: 7,
				y: 2
			}
		};
		exp = {
			1005: {
				x: 5,
				y: 1,
				artifact: "offset",
				aid: "FOO",
				artifactdir: 1,
				foo:"bar"
			},
			2007: {
				x: 7,
				y: 2,
				artifact: "offset",
				aid: "FOO",
				artifactdir: 1,
				bar:"baz"
			}
		};
		res = Algol.artifact.offset(definition,starts,boarddims);
		assertEquals(exp,res);
	},
	"test should have support for relative direction": function(){
		var definition, starts, boarddims = {x:7,y:5}, exp, res;
		definition = {
			forward: 2,
			right: 1,
			aid: "FOO",
			relative: true
		};
		starts = {
			3002: {
				x: 2,
				y: 3,
				uid: 666,
				dir: 3
			},
			4004: {
				x: 4,
				y: 4,
				dir: 7
			},
			2007: {
				x: 7,
				y: 2,
				dir: 5
			}
		};
		exp = {
			4004: {
				x: 4,
				y: 4,
				artifact: "offset",
				aid: "FOO",
				uid: 666,
				artifactdir: 3,
				dir: 3
			},
			3002: {
				x: 2,
				y: 3,
				artifact: "offset",
				aid: "FOO",
				dir: 7,
				artifactdir: 7
			},
			4006: {
				x: 6,
				y: 4,
				artifact: "offset",
				aid: "FOO",
				dir: 5,
				artifactdir: 5
			}
		};
		res = Algol.artifact.offset(definition,starts,boarddims);
		assertEquals(exp,res);
	}
});

TestCase("Artifact walker",{
	"test should be defined":function(){
		assertFunction(Algol.artifact.walker);
	},
	"test should return correct artifacts": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1,3,5],
			createatstop: true
		};
		starts = {
			4002: {
				x: 2,
				y: 4
			}
		};
		stops = {
			1002: {
				x: 2,
				y: 1
			},
			4005: {
				x: 5,
				y: 4
			}
		};
		exp = {
			1002: {
				x: 2,
				y: 1,
				artifact: "walkstop",
				aid: "FOO",
				artifactdir: 1
			},
			4005: {
				x: 5,
				y: 4,
				artifact: "walkstop",
				aid: "FOO",
				artifactdir: 3
			}
		};
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		console.log(exp,res);
		assertEquals(exp,res);
	},
	"test should mark steps also if createatstep is set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: true,
			createatstep: true
		};
		starts = {
			4002: {
				x: 2,
				y: 4
			}
		};
		stops = {
			1002: {
				x: 2,
				y: 1
			}
		};
		exp = {
			3002: {
				x: 2,
				y: 3,
				artifact: "walkstep",
				aid: "FOO",
				step: 1,
				artifactdir: 1
			},
			2002: {
				x: 2,
				y: 2,
				artifact: "walkstep",
				aid: "FOO",
				step: 2,
				artifactdir: 1
			},
			1002: {
				x: 2,
				y: 1,
				artifact: "walkstop",
				aid: "FOO",
				artifactdir: 1
			}
		};
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should not mark stop if no createatstop is set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstep: true
		};
		starts = {
			4002: {
				x: 2,
				y: 4
			}
		};
		stops = {
			1002: {
				x: 2,
				y: 1
			}
		};
		exp = {
			3002: {
				x: 2,
				y: 3,
				artifact: "walkstep",
				aid: "FOO",
				step: 1,
				artifactdir: 1
			},
			2002: {
				x: 2,
				y: 2,
				artifact: "walkstep",
				aid: "FOO",
				step: 2,
				artifactdir: 1
			}
		};
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should include stuff from startsquare": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: true,
			createatstep: true
		};
		starts = {
			4002: {
				x: 2,
				y: 4,
				uid: 666
			}
		};
		stops = {
			1002: {
				x: 2,
				y: 1
			}
		};
		exp = {
			3002: {
				x: 2,
				y: 3,
				artifact: "walkstep",
				aid: "FOO",
				step: 1,
				uid: 666,
				artifactdir: 1
			},
			2002: {
				x: 2,
				y: 2,
				artifact: "walkstep",
				aid: "FOO",
				step: 2,
				uid: 666,
				artifactdir: 1
			},
			1002: {
				x: 2,
				y: 1,
				artifact: "walkstop",
				aid: "FOO",
				uid: 666,
				artifactdir: 1
			}
		};
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should support relative dirs": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1,3],
			createatstop: true,
			createatstep: true,
			relative: true
		};
		starts = {
			4002: {
				x: 2,
				y: 4,
				dir: 3
			}
		};
		stops = {
			4005: {
				x: 5,
				y: 4
			},
			5002: {
				x: 2,
				y: 5
			}
		};
		exp = {
			4003: {
				x: 3,
				y: 4,
				artifact: "walkstep",
				aid: "FOO",
				step: 1,
				dir: 3,
				artifactdir: 3
			},
			4004: {
				x: 4,
				y: 4,
				artifact: "walkstep",
				aid: "FOO",
				step: 2,
				dir: 3,
				artifactdir: 3
			},
			4005: {
				x: 5,
				y: 4,
				artifact: "walkstop",
				aid: "FOO",
				dir: 3,
				artifactdir: 3
			},
			5002: {
				x: 2,
				y: 5,
				artifact: "walkstop",
				aid: "FOO",
				dir: 3,
				artifactdir: 5
			}
		};
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should work with non-orthogonal relative dirs": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: true,
			createatstep: true,
			relative: true,
			stoptag: "wuu",
			steptag: "wee"
		};
		starts = {
			4002: {
				x: 2,
				y: 4,
				dir: 2
			}
		};
		stops = {
			5001: {
				x: 1,
				y: 5
			}
		};
		exp = {
			3003: {
				x: 3,
				y: 3,
				artifact: "walkstep",
				aid: "FOO",
				step: 1,
				dir: 2,
				artifactdir: 2
			},
			2004: {
				x: 4,
				y: 2,
				artifact: "walkstep",
				aid: "FOO",
				step: 2,
				dir: 2,
				artifactdir: 2
			},
			1005: {
				x: 5,
				y: 1,
				artifact: "walkstep",
				aid: "FOO",
				step: 3,
				dir: 2,
				artifactdir: 2
			}
		};
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should honour maxlength": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: true,
			createatstep: true,
			relative: true,
			max: 3
		};
		starts = {
			4002: {
				x: 2,
				y: 4,
				uid: 666,
				dir: 3
			}
		};
		stops = {
			5001: {
				x: 1,
				y: 5
			}
		};
		exp = {
			4003: {
				x: 3,
				y: 4,
				artifact: "walkstep",
				aid: "FOO",
				step: 1,
				uid: 666,
				dir: 3,
				artifactdir: 3
			},
			4004: {
				x: 4,
				y: 4,
				artifact: "walkstep",
				aid: "FOO",
				step: 2,
				uid: 666,
				dir: 3,
				artifactdir: 3
			},
			4005: {
				x: 5,
				y: 4,
				artifact: "walkstep",
				aid: "FOO",
				step: 3,
				uid: 666,
				dir: 3,
				artifactdir: 3
			}
		};
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should honour steps if set": function(){
		var def,starts,stops,steps,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: true,
			createatstep: true,
			stopmark: "BAR",
			stepmark: "BAZ",
			stoptag: "wuu",
			steptag: "wee"
		};
		starts = {
			4002: {
				x: 2,
				y: 4,
				uid: 666
			}
		};
		stops = {
			1002: {
				x: 2,
				y: 1
			}
		};
		steps = {
			3002: {
				x: 2,
				y: 3
			}
		};
		exp = {
			3002: {
				x: 2,
				y: 3,
				artifact: "walkstep",
				aid: "FOO",
				step: 1,
				uid: 666,
				artifactdir: 1
			}
		};
		res = Algol.artifact.walker(def,starts,stops,boarddims,steps);
		assertEquals(exp,res);
	}
});

TestCase("Spawn",{
	"test should be defined": function(){
		assertFunction(Algol.artifact.spawn);
	},
	"test should return correct artifacts": function(){
		var where, exp, def, res;
		def = {
			aid: "spawntest"
		};
		where = {
			3002: {
				x:2,y:3,foo:"BAR"
			}
		};
		exp = {
			3002: {
				x: 2,
				y: 3,
				foo: "BAR",
				aid: "spawntest",
				artifact: "spawn"
			}
		};
		res = Algol.artifact.spawn(def,where); 
		assertEquals(exp,res);
	}
});

TestCase("MoveInDir",{
	"test should be defined":function(){
		assertFunction(Algol.utils.moveInDir);
	},
	"test should return proper coords": function(){
		assertEquals({x:5,y:1},Algol.utils.moveInDir(4,4,1,3,1));
		assertEquals({x:8,y:2},Algol.utils.moveInDir(4,4,2,3,1));
		assertEquals({x:7,y:5},Algol.utils.moveInDir(4,4,3,3,1));
		assertEquals({x:6,y:8},Algol.utils.moveInDir(4,4,4,3,1));
		assertEquals({x:3,y:7},Algol.utils.moveInDir(4,4,5,3,1));
		assertEquals({x:0,y:6},Algol.utils.moveInDir(4,4,6,3,1));
		assertEquals({x:1,y:3},Algol.utils.moveInDir(4,4,7,3,1));
		assertEquals({x:2,y:0},Algol.utils.moveInDir(4,4,8,3,1));
	}
});

TestCase("dirRelativeTo",{
	"test should be defined": function(){
		assertFunction(Algol.utils.dirRelativeTo);
	},
	"test should return proper translations": function(){
		assertEquals(4,Algol.utils.dirRelativeTo(1,4));
		assertEquals(5,Algol.utils.dirRelativeTo(2,4));
		assertEquals(7,Algol.utils.dirRelativeTo(8,8));
		assertEquals(1,Algol.utils.dirRelativeTo(3,7));
	}
});


TestCase("MeldObjects",{
	"test should be defined": function(){
		assertFunction(Algol.utils.meldObjects);
	},
	"test should meld objects with different props": function(){
		var o1, o2, res, exp;
		o1 = {
			foo:"bar"
		};
		o2 = {
			baz:"biz"
		};
		exp = {
			foo: "bar",
			baz: "biz"
		};
		res = Algol.utils.meldObjects(o1,o2);
		assertEquals(exp,res);
	},
	"test should retain 1 version of duplicate prop with same value": function(){
		var o1, o2, res, exp;
		o1 = {
			foo:"bar",
			x:5
		};
		o2 = {
			baz:"biz",
			x:5
		};
		exp = {
			foo: "bar",
			baz: "biz",
			x:5
		};
		res = Algol.utils.meldObjects(o1,o2);
		assertEquals(exp,res);
	},
	"test should make array for same props with different values": function(){
		var o1, o2, res, exp;
		o1 = {
			foo:"bar",
			x:5
		};
		o2 = {
			baz:"biz",
			x:7
		};
		exp = {
			foo: "bar",
			baz: "biz",
			x:[5,7]
		};
		res = Algol.utils.meldObjects(o1,o2);
		assertEquals(exp,res);
	},
	"test should extend array for same prop if 1st is already array": function(){
		var o1, o2, res, exp;
		o1 = {
			foo:"bar",
			x:[5,7]
		};
		o2 = {
			baz:"biz",
			x:8
		};
		exp = {
			foo: "bar",
			baz: "biz",
			x:[5,7,8]
		};
		res = Algol.utils.meldObjects(o1,o2);
		assertEquals(exp,res);
	}
});

TestCase("Tester (YKX version)",{
	"test should be defined": function(){
		assertFunction(Algol.cauldron.tester);
	},
	"test should execute single query correctly": function(){
		var cauldron, test, vars, res, exp;
		cauldron = {
			hat: {
				8003: [{
					foo: "bar"
				},{
					foo: "bee"
				}],
				1005: [{
					foo: "wuu"
				}]
			}
		};
		test = {
			from: "hat",
			props: {
				foo: "bee"
			}
		};
		exp = {
			8003: {
				foo: "bee"
			}
		};
		res = Algol.cauldron.tester(cauldron,test,vars);
		assertEquals(exp,res);
	},
	"test should run normal AND test properly": function(){
		var cauldron, test, query1, query2, res, exp;
		cauldron = {
			hat: {
				8003: [{
					foo: "bar"
				},{
					foo: "bee"
				}],
				1005: [{
					foo: "wee"
				}]
			},
			cat: {
				1005: {
					foo: "wuu"
				}
			}
		};
		test = {
			tests: [{
				from: "hat",
				props: {
					foo:["wee","bee"]
				}
			},{
				from: "cat",
				props: {
					foo:"wuu"
				}
			}]
		};
		exp = {
			1005: {
				foo: ["wuu","wee"]
			}
		};
		res = Algol.cauldron.tester(cauldron,test,{});
		assertEquals(exp,res);
	},
	"test should run honour except test": function(){
		var cauldron, test, res, exp;
		cauldron = {
			hat: {
				8003: [{
					foo: "bar"
				},{
					foo: "bee"
				}],
				1005: [{
					foo: "wee"
				}]
			},
			cat: {
				1005: {
					foo: "wuu"
				}
			}
		};
		test = {
			tests: [{
				from: "hat",
				props: {
					foo:["bar","wee"]
				}
			}],
			except: {
				from: "cat",
				props: {
					foo: "wuu"
				}
			}
		};
		exp = {
			8003: {
				foo: "bar"
			}
		};
		res = Algol.cauldron.tester(cauldron,test,{});
		assertEquals(exp,res);
	}
});

TestCase("Querier (YKX version)",{
	"test should be defined": function(){
		assertFunction(Algol.cauldron.querier);
	},
	"test should return array of objects with unique positions that fulfil the props reqs": function(){
		var cauldron, query, res, exp;
		cauldron = {
			hat: {
				8003: [{
					foo: "bar"
				},{
					foo: "bee"
				}],
				1005: [{
					foo: "wuu"
				}]
			}
		};
		query = {
			from: "hat",
			props: {
				foo: "bee"
			}
		};
		exp = {
			8003: {
				foo: "bee"
			}
		};
		res = Algol.cauldron.querier(cauldron,query);
		assertEquals(exp,res);
	},
	"test should handle being give bowl straight instead of cauldron": function(){
		var bowl, query, res, exp;
		bowl = {
			8003: [{
				foo: "bar"
			}, {
				foo: "bee"
			}],
			1005: [{
				foo: "wuu"
			}]
		};
		query = {
			from: "hat",
			props: {
				foo: "bee"
			}
		};
		exp = {
			8003: {
				foo: "bee"
			}
		};
		res = Algol.cauldron.querier(bowl,query);
		assertEquals(exp,res);
	},
	"test should handle multiple possible values in props": function(){
		var bowl, query, res, exp;
		bowl = {
			8003: [{
				foo: "bar"
			}, {
				foo: "bee"
			}],
			1005: [{
				foo: "wuu"
			}]
		};
		query = {
			from: "hat",
			props: {
				foo: ["bee","waa"]
			}
		};
		exp = {
			8003: {
				foo: "bee"
			}
		};
		res = Algol.cauldron.querier(bowl,query);
		assertEquals(exp,res);
	},
	"test should handle variables": function(){
		var bowl, query, res, exp, vars;
		bowl = {
			8003: [{
				foo: 2
			}, {
				foo: "bee"
			}],
			1005: [{
				foo: "wuu"
			}]
		};
		query = {
			from: "hat",
			props: {
				foo: "CURRENTPLAYER"
			}
		};
		exp = {
			8003: {
				foo: 2
			}
		};
		vars = {
			"CURRENTPLAYER":2
		};
		res = Algol.cauldron.querier(bowl,query,vars);
		assertEquals(exp,res);
	},
	"test should handle variables in array of multiple values": function(){
		var bowl, query, res, exp, vars;
		bowl = {
			8003: [{
				foo: 2
			}, {
				foo: "bee"
			}],
			1005: [{
				foo: "wuu"
			}]
		};
		query = {
			from: "hat",
			props: {
				foo: ["boo","CURRENTPLAYER"]
			}
		};
		exp = {
			8003: {
				foo: 2
			}
		};
		vars = {
			"CURRENTPLAYER":2
		};
		res = Algol.cauldron.querier(bowl,query,vars);
		assertEquals(exp,res);
	},
	"test should handle bowl with single-value YKX entry": function(){
		var bowl, query, res, exp, vars;
		bowl = {
			8003: {
				foo: 2
			}
		};
		query = {
			from: "hat",
			props: {
				foo: ["boo","CURRENTPLAYER"]
			}
		};
		exp = {
			8003: {
				foo: 2
			}
		};
		vars = {
			"CURRENTPLAYER":2
		};
		res = Algol.cauldron.querier(bowl,query,vars);
		assertEquals(exp,res);
	},
	"test should meld objects if more than 1 fulfil query": function(){
		var bowl, query, res, exp;
		bowl = {
			8003: [{
				foo: "bee",
				what: "bah"
			}, {
				foo: "bee",
				what: "guh",
				x: 666
			}],
			1005: [{
				foo: "bee"
			}]
		};
		query = {
			from: "hat",
			props: {
				foo: "bee"
			}
		};
		exp = {
			8003: {
				foo: "bee",
				what: ["bah","guh"],
				x: 666
			},
			1005: {
				foo: "bee"
			}
		};
		res = Algol.cauldron.querier(bowl,query);
		assertEquals(exp,res);
	}
});



TestCase("Cauldron - GetUnitBowl",{
	"test should be defined": function(){
		assertFunction(Algol.cauldron.getUnitBowl);
	},
	"test should get right timestate": function(){
		var setup, states, moulds, exp, res, step = 5;
		setup = {
			1: {
				uid: 1,
				x: 1,
				y: 1
			}
		};
		states = {
			1: {
				x: [[2,4],[4,5],[6,10]]
			}
		};
		moulds = {
			
		};
		exp = {1005:[{uid:1,x:5,y:1}]};
		res = Algol.cauldron.getUnitBowl(setup,states,moulds,step);
		assertEquals(exp,res);
	},
	"test should include props from mould": function(){
		var setup, states, moulds, exp, res, step = 5;
		setup = {
			1: {
				uid: 1,
				x: 1,
				y: 1,
				unit: "foo"
			}
		};
		states = {
			1: {
				x: [[2,4],[4,5],[6,10]]
			}
		};
		moulds = {
			foo: {
				bar: "baz"
			}
		};
		exp = {
			1005: [{
				uid: 1,
				x: 5,
				y: 1,
				unit: "foo",
				bar: "baz"
			}]
		};
		res = Algol.cauldron.getUnitBowl(setup,states,moulds,step);
		assertEquals(exp,res);
	}
});

TestCase("Cauldron - GetTerrainBowl",{
	"test should be defined": function(){
		assertFunction(Algol.cauldron.getTerrainBowl);
	},
	"test should get right timestate": function(){
		var terrain, states, moulds, exp, res, step = 5;
		terrain = {
			1001: {
				x: 1,
				y: 1,
				foo: "bar"
			}
		};
		shifts = {
			1001: {
				foo: [[4,"baz"]]
			}
		};
		moulds = {};
		exp = {
			1001: {x:1,y:1,foo:"baz"}
		};
		res = Algol.cauldron.getTerrainBowl(terrain,shifts,moulds,step);
		assertEquals(exp,res);
	},
	"test should augment props from mould if appropriate": function(){
		var terrain, states, moulds, exp, res, step = 5;
		terrain = {
			1001: {
				x: 1,
				y: 1,
				terrain: "meadow"
			}
		};
		shifts = {
			1001: {
				terrain: [[4,"forest"]]
			}
		};
		moulds = {
			forest: {
				trees: "a lot"
			}
		};
		exp = {
			1001: {x:1,y:1,terrain:"forest",trees:"a lot"}
		};
		res = Algol.cauldron.getTerrainBowl(terrain,shifts,moulds,step);
		assertEquals(exp,res);
	}
});

