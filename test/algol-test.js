TestCase("Algol namespace definition",{
	"test should be an object": function(){
		assertObject("should be defined",Algol);
	}
});

TestCase("testObjectProperties",{
	"test should be defined": function(){
		assertFunction(Algol.utils.testObjectProperties);
	},
	"test should return true if object has all props": function(){
		assertTrue(Algol.utils.testObjectProperties({x:4,y:5,z:6},{y:5}));
	},
	"test should return false if object does not have all props": function(){
		assertFalse(Algol.utils.testObjectProperties({x:4,y:5,z:6},{y:5,p:555}));
	}
});

TestCase("testObject",{
	"test should be defined": function(){
		assertFunction(Algol.utils.testObject);
	},
	"test should use testObjectProperties if called with props obj": function(){
		var obj = {x:4,y:5,z:6},
			pass = {type:"PROPS",props:{y:5}},
			fail = {type:"PROPS",props:{y:5,p:666}};
		assertTrue(Algol.utils.testObject(obj,pass));
		assertFalse(Algol.utils.testObject(obj,fail));
	},
	"test should assume that testobj is a props obj if no known type is given": function(){
		var obj = {x:4,y:5,z:6};
		assertTrue(Algol.utils.testObject(obj,{y:5}));
	},
	"test should loop through tests in AND type obj and return correct type": function(){
		var obj = {x:4,y:5,z:6},
			pass = {type:"PROPS",props:{y:5}},
			fail = {type:"PROPS",props:{y:5,p:666}};
		assertTrue(Algol.utils.testObject(obj,{type:"AND",tests:[pass,pass]}));
		assertFalse(Algol.utils.testObject(obj,{type:"AND",tests:[pass,fail]}));
	},
	"test should loop through tests in AND type obj and return correct type": function(){
		var obj = {x:4,y:5,z:6},
			pass = {type:"PROPS",props:{y:5}},
			fail = {type:"PROPS",props:{y:5,p:666}};
		assertTrue(Algol.utils.testObject(obj,{type:"OR",tests:[pass,fail]}));
		assertFalse(Algol.utils.testObject(obj,{type:"OR",tests:[fail,fail]}));
	},
	"test should handle NOT correctly": function(){
		var obj = {x:4,y:5,z:6},
			pass = {type:"PROPS",props:{y:5}},
			fail = {type:"PROPS",props:{y:5,p:666}};
		assertTrue(Algol.utils.testObject(obj,{type:"NOT",test:fail}));
		assertFalse(Algol.utils.testObject(obj,{type:"NOT",test:pass}));
	},
	"test should nest correctly": function(){
		var obj = {x:4,y:5,z:6},
			pass = {type:"PROPS",props:{y:5}},
			fail = {type:"PROPS",props:{y:5,p:666}};
		assertTrue(Algol.utils.testObject(obj,{
			type: "AND",
			tests: [pass,pass,{
				type: "OR",
				tests: [fail,{
					type: "NOT",
					test: fail
				}]
			}]
		}));
	}
});

TestCase("Filter list function",{
	"test should be defined": function(){
		assertFunction(Algol.utils.filterList);
	},
	"test should return array of all objs in list that fulfill test": function(){
		var obj1 = {foo:"a"}, obj2 = {foo:"b"}, obj3 = {foo:"b"}, obj4 = {foo:"c"},
		    list = [obj1,obj2,obj3,obj4],
			test = {foo:"b"};
		assertEquals([obj2,obj3],Algol.utils.filterList(list,test));
	}
});


TestCase("CalcPropertyValue",{
	"test should be defined": function(){
		assertFunction(Algol.utils.calcPropertyValue);
	},
	"test if no changes should just return start value": function(){
		assertEquals("a",Algol.utils.calcPropertyValue("a"));
	},
	"test if no step, should return last value from the list": function(){
		assertEquals("d",Algol.utils.calcPropertyValue("a",[[2,"b"],[3,"c"],[4,"d"]]));
	},
	"test if changes and step, should return correct value": function(){
		var changes = [[2,"b"],[4,"c"],[8,"d"]];
		assertEquals("d",Algol.utils.calcPropertyValue("a",changes,10));
		assertEquals("c",Algol.utils.calcPropertyValue("a",changes,4));
		assertEquals("b",Algol.utils.calcPropertyValue("a",changes,3));
		assertEquals("a",Algol.utils.calcPropertyValue("a",changes,1));
	}
});


TestCase("CalcObject",{
	"test should be defined": function(){
		assertFunction(Algol.utils.calcObject);
	},
	"test if no changes, should just return startprops": function(){
		var startprops = {a:1,b:1,c:1},
			changes = undefined,
			step = undefined,
			res = Algol.utils.calcObject(startprops,changes,step);
		assertEquals(startprops,res);
	},
	"test should return correct props": function(){
		var startprops = {A:"a",B:"b",C:"c"},
			changes = {
				A:[[1,"aa"],[3,"aaa"]],
				B:[[2,"bb"],[5,"bbb"]]
			},
			step = undefined,
			res = Algol.utils.calcObject(startprops,changes,step);
		assertEquals({A:"aaa",B:"bbb",C:"c"},res);
	}
});

TestCase("calcCollection",{
	"test should be defined": function(){
		assertFunction(Algol.utils.calcCollection);
	},
	"test if no changeset, should just return startset": function(){
		var startset = {
			u1: {A:"a",B:"b"},
			u2: {A:"-a",B:"-b"}
		},
		    changeset = undefined,
			step = undefined,
			res = Algol.utils.calcCollection(startset,changeset,step);
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
			res = Algol.utils.calcCollection(startset,changeset,step),
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
			create: "artifact",
			aid: "FOO"
		};
		starts = [{x:2,y:3},{x:4,y:4},{x:7,y:2}];
		exp = [{x:5,y:1,type:"artifact",aid:"FOO"},{x:7,y:2,type:"artifact",aid:"FOO"}];
		res = Algol.artifact.offset(definition,starts,boarddims);
		assertEquals(exp,res);
	},
	"test should include uid if set in startsquare": function(){
		var definition, starts, boarddims = {x:7,y:5}, exp, res;
		definition = {
			forward: 2,
			right: 3,
			create: "artifact",
			aid: "FOO"
		};
		starts = [{x:2,y:3,uid:666},{x:4,y:4},{x:7,y:2}];
		exp = [{x:5,y:1,type:"artifact",aid:"FOO",uid:666},{x:7,y:2,type:"artifact",aid:"FOO"}];
		res = Algol.artifact.offset(definition,starts,boarddims);
		assertEquals(exp,res);
	},
	"test should have support for relative direction": function(){
		var definition, starts, boarddims = {x:7,y:5}, exp, res;
		definition = {
			forward: 2,
			right: 1,
			create: "artifact",
			aid: "FOO",
			relative: true
		};
		starts = [{x:2,y:3,uid:666,dir:3},{x:4,y:4,dir:7},{x:7,y:2,dir:5}];
		exp = [{x:4,y:4,type:"artifact",aid:"FOO",uid:666},
		       {x:2,y:3,type:"artifact",aid:"FOO"},
			   {x:6,y:4,type:"artifact",aid:"FOO"}];
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
			createatstop: "artifact"
		};
		starts = [{x:2,y:4}];
		stops = [{x:2,y:1},{x:5,y:4}];
		exp = [{x:2,y:1,type:"artifact",aid:"FOO"},
		       {x:5,y:4,type:"artifact",aid:"FOO"}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should mark steps also if createatstep is set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: "artifact",
			createatstep: "marktarget"
		};
		starts = [{x:2,y:4}];
		stops = [{x:2,y:1}];
		exp = [{x:2,y:3,type:"marktarget",aid:"FOO",step:1},
			   {x:2,y:2,type:"marktarget",aid:"FOO",step:2},
		       {x:2,y:1,type:"artifact",aid:"FOO"}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should not mark stop if no createatstop is set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstep: "marktarget"
		};
		starts = [{x:2,y:4}];
		stops = [{x:2,y:1}];
		exp = [{x:2,y:3,type:"marktarget",aid:"FOO",step:1},
			   {x:2,y:2,type:"marktarget",aid:"FOO",step:2}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should include uid from startsquare if set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: "artifact",
			createatstep: "marktarget"
		};
		starts = [{x:2,y:4,uid:666}];
		stops = [{x:2,y:1}];
		exp = [{x:2,y:3,type:"marktarget",aid:"FOO",step:1,uid:666},
			   {x:2,y:2,type:"marktarget",aid:"FOO",step:2,uid:666},
		       {x:2,y:1,type:"artifact",aid:"FOO",uid:666}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should support relative dirs": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1,3],
			createatstop: "artifact",
			createatstep: "marktarget",
			relative: true
		};
		starts = [{x:2,y:4,uid:666,dir:3}];
		stops = [{x:5,y:4},{x:2,y:5}];
		exp = [{x:3,y:4,type:"marktarget",aid:"FOO",step:1,uid:666},
			   {x:4,y:4,type:"marktarget",aid:"FOO",step:2,uid:666},
		       {x:5,y:4,type:"artifact",aid:"FOO",uid:666},
			   {x:2,y:5,type:"artifact",aid:"FOO",uid:666}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should work with non-orthogonal relative dirs": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: "artifact",
			createatstep: "marktarget",
			relative: true
		};
		starts = [{x:2,y:4,uid:666,dir:2}];
		stops = [{x:1,y:5}];
		exp = [{x:3,y:3,type:"marktarget",aid:"FOO",step:1,uid:666},
			   {x:4,y:2,type:"marktarget",aid:"FOO",step:2,uid:666},
			   {x:5,y:1,type:"marktarget",aid:"FOO",step:3,uid:666}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
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
