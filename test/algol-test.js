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
			aid: "FOO",
			tag: "wuu"
		};
		starts = [{x:2,y:3},{x:4,y:4},{x:7,y:2}];
		exp = [{x:5,y:1,artifact:"offset",aid:"FOO",dir:1,tag:"wuu"},{x:7,y:2,artifact:"offset",aid:"FOO",dir:1,tag:"wuu"}];
		res = Algol.artifact.offset(definition,starts,boarddims);
		assertEquals(exp,res);
	},
	"test should include uid if set in startsquare": function(){
		var definition, starts, boarddims = {x:7,y:5}, exp, res;
		definition = {
			forward: 2,
			right: 3,
			aid: "FOO",
			tag: "wuu"
		};
		starts = [{x:2,y:3,uid:666},{x:4,y:4},{x:7,y:2}];
		exp = [{x:5,y:1,artifact:"offset",aid:"FOO",uid:666,dir:1,tag:"wuu"},{x:7,y:2,artifact:"offset",aid:"FOO",dir:1,tag:"wuu"}];
		res = Algol.artifact.offset(definition,starts,boarddims);
		assertEquals(exp,res);
	},
	"test should have support for relative direction": function(){
		var definition, starts, boarddims = {x:7,y:5}, exp, res;
		definition = {
			forward: 2,
			right: 1,
			aid: "FOO",
			relative: true,
			tag: "wuu"
		};
		starts = [{x:2,y:3,uid:666,dir:3},{x:4,y:4,dir:7},{x:7,y:2,dir:5}];
		exp = [{x:4,y:4,artifact:"offset",aid:"FOO",uid:666,dir:3,tag:"wuu"},
		       {x:2,y:3,artifact:"offset",aid:"FOO",dir:7,tag:"wuu"},
			   {x:6,y:4,artifact:"offset",aid:"FOO",dir:5,tag:"wuu"}];
		res = Algol.artifact.offset(definition,starts,boarddims);
		assertEquals(exp,res);
	},
	"test should include mark if set": function(){
		var definition, starts, boarddims = {x:7,y:5}, exp, res;
		definition = {
			forward: 2,
			right: 3,
			aid: "FOO",
			mark: "BAR",
			tag: "wuu"
		};
		starts = [{x:2,y:3},{x:4,y:4},{x:7,y:2}];
		exp = [{x:5,y:1,artifact:"offset",aid:"FOO",mark:"BAR",dir:1,tag:"wuu"},{x:7,y:2,artifact:"offset",aid:"FOO",mark:"BAR",dir:1,tag:"wuu"}];
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
			createatstop: true,
			stoptag: "wuu"
		};
		starts = [{x:2,y:4}];
		stops = [{x:2,y:1},{x:5,y:4}];
		exp = [{x:2,y:1,artifact:"walkstop",aid:"FOO",dir:1,tag:"wuu"},
		       {x:5,y:4,artifact:"walkstop",aid:"FOO",dir:3,tag:"wuu"}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should mark steps also if createatstep is set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: true,
			createatstep: true,
			stoptag: "wuu",
			steptag: "wee"
		};
		starts = [{x:2,y:4}];
		stops = [{x:2,y:1}];
		exp = [{x:2,y:3,artifact:"walkstep",aid:"FOO",step:1,dir:1,tag:"wee"},
			   {x:2,y:2,artifact:"walkstep",aid:"FOO",step:2,dir:1,tag:"wee"},
		       {x:2,y:1,artifact:"walkstop",aid:"FOO",dir:1,tag:"wuu"}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should not mark stop if no createatstop is set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstep: true,
			steptag: "wuu"
		};
		starts = [{x:2,y:4}];
		stops = [{x:2,y:1}];
		exp = [{x:2,y:3,artifact:"walkstep",aid:"FOO",step:1,dir:1,tag:"wuu"},
			   {x:2,y:2,artifact:"walkstep",aid:"FOO",step:2,dir:1,tag:"wuu"}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should include uid from startsquare if set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
		def = {
			aid: "FOO",
			dirs: [1],
			createatstop: true,
			createatstep: true,
			stoptag: "wuu",
			steptag: "wee"
		};
		starts = [{x:2,y:4,uid:666}];
		stops = [{x:2,y:1}];
		exp = [{x:2,y:3,artifact:"walkstep",aid:"FOO",step:1,uid:666,dir:1,tag:"wee"},
			   {x:2,y:2,artifact:"walkstep",aid:"FOO",step:2,uid:666,dir:1,tag:"wee"},
		       {x:2,y:1,artifact:"walkstop",aid:"FOO",uid:666,dir:1,tag:"wuu"}];
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
			relative: true,
			stoptag: "wuu",
			steptag: "wee"
		};
		starts = [{x:2,y:4,uid:666,dir:3}];
		stops = [{x:5,y:4},{x:2,y:5}];
		exp = [{x:3,y:4,artifact:"walkstep",aid:"FOO",step:1,uid:666,dir:3,tag:"wee"},
			   {x:4,y:4,artifact:"walkstep",aid:"FOO",step:2,uid:666,dir:3,tag:"wee"},
		       {x:5,y:4,artifact:"walkstop",aid:"FOO",uid:666,dir:3,tag:"wuu"},
			   {x:2,y:5,artifact:"walkstop",aid:"FOO",uid:666,dir:5,tag:"wuu"}];
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
		starts = [{x:2,y:4,uid:666,dir:2}];
		stops = [{x:1,y:5}];
		exp = [{x:3,y:3,artifact:"walkstep",aid:"FOO",step:1,uid:666,dir:2,tag:"wee"},
			   {x:4,y:2,artifact:"walkstep",aid:"FOO",step:2,uid:666,dir:2,tag:"wee"},
			   {x:5,y:1,artifact:"walkstep",aid:"FOO",step:3,uid:666,dir:2,tag:"wee"}];
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
			max: 3,
			stoptag: "wuu",
			steptag: "wee"
		};
		starts = [{x:2,y:4,uid:666,dir:3}];
		stops = [{x:1,y:5}];
		exp = [{x:3,y:4,artifact:"walkstep",aid:"FOO",step:1,uid:666,dir:3,tag:"wee"},
			   {x:4,y:4,artifact:"walkstep",aid:"FOO",step:2,uid:666,dir:3,tag:"wee"},
			   {x:5,y:4,artifact:"walkstep",aid:"FOO",step:3,uid:666,dir:3,tag:"wee"}];
		res = Algol.artifact.walker(def,starts,stops,boarddims);
		assertEquals(exp,res);
	},
	"test should include mark if set": function(){
		var def,starts,stops,boarddims = {x:7,y:5}, exp, res;
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
		starts = [{x:2,y:4,uid:666}];
		stops = [{x:2,y:1}];
		exp = [{x:2,y:3,artifact:"walkstep",aid:"FOO",mark:"BAZ",step:1,uid:666,dir:1,tag:"wee"},
			   {x:2,y:2,artifact:"walkstep",aid:"FOO",mark:"BAZ",step:2,uid:666,dir:1,tag:"wee"},
		       {x:2,y:1,artifact:"walkstop",aid:"FOO",mark:"BAR",uid:666,dir:1,tag:"wuu"}];
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
		starts = [{x:2,y:4,uid:666}];
		stops = [{x:2,y:1}];
		steps = [{x:2,y:3}];
		exp = [{x:2,y:3,artifact:"walkstep",aid:"FOO",mark:"BAZ",step:1,uid:666,dir:1,tag:"wee"}];
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
		where = [{x:2,y:3,foo:"BAR"}];
		exp = [{x:2,y:3,foo:"BAR",aid:"spawntest",artifact:"spawn"}];
		res = Algol.artifact.spawn(def,where); 
		assertEquals(exp,res);
	},
	"test should include tags": function(){
		var where, exp, def, res;
		def = {
			aid: "spawntest",
			tag: "WOOO"
		};
		where = [{x:2,y:3,foo:"BAR"}];
		exp = [{x:2,y:3,foo:"BAR",aid:"spawntest",artifact:"spawn",tag:"WOOO"}];
		res = Algol.artifact.spawn(def,where); 
		assertEquals(exp,res);
	},
	"test should include marks": function(){
		var where, exp, def, res;
		def = {
			aid: "spawntest",
			mark: "BAX"
		};
		where = [{x:2,y:3,foo:"BAR"}];
		exp = [{x:2,y:3,foo:"BAR",aid:"spawntest",artifact:"spawn",mark:"BAX"}];
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


TestCase("FindCommonPos",{
	"test should be defined": function(){
		assertFunction(Algol.cauldron.findCommonPos);
	},
	"test should return correct pos": function(){
		var lists = [
			[{x:2,y:2},{x:2,y:3},{x:2,y:4},{x:1,y:666}],
			[{x:1,y:666},{x:2,y:3}],
			[{x:2,y:3},{x:1,y:666}]
		];
		assertEquals([{x:1,y:666},{x:2,y:3}],Algol.cauldron.findCommonPos(lists));
	},
	"test if only one list, should return positions for all of that list": function(){
		var lists = [[{x:2,y:2},{x:2,y:3},{x:2,y:4},{x:1,y:666}]],
			exp = [{x:2,y:2},{x:2,y:3},{x:2,y:4},{x:1,y:666}];
		assertEquals(exp,Algol.cauldron.findCommonPos(lists));
	}
});


TestCase("collectPotentialMarks",{
	"test should be defined": function(){
		assertFunction(Algol.utils.collectPotentialMarks);
	},
	"test should return empty array if no matches": function(){
		assertEquals([],Algol.utils.collectPotentialMarks({},[],[]));
	},
	"test should not collect for marks with required mark missing": function(){
		var markdefs, selmarks, artifacts, exp;
		markdefs = {
			foo: {
				requiremark: "bar"
			}
		};
		selmarks = [];
		artifacts = [{
			mark: "foo"
		}];
		exp = [];
		assertEquals([],Algol.utils.collectPotentialMarks(markdefs,selmarks,artifacts));
	},
	"test should not collect for marks with failing property check": function(){
		var markdefs, selmarks, artifacts, exp;
		markdefs = {
			foo: {
				requiremark: "bar",
				requiresame: "tag"
			}
		};
		selmarks = [{
			mark: "bar",
			tag: "XXX"
		}];
		artifacts = [{
			mark: "foo",
			tag: "YYY"
		}];
		exp = [];
		assertEquals([],Algol.utils.collectPotentialMarks(markdefs,selmarks,artifacts));
	},
	"test should collect for marks with fulfilled checks": function(){
		var markdefs, selmarks, artifacts, exp;
		markdefs = {
			foo: {
				requiremark: "bar",
				requiresame: "tag"
			}
		};
		selmarks = [{
			mark: "bar",
			tag: "XXX"
		}];
		artifacts = [{
			mark: "foo",
			tag: "XXX"
		},{
			mark: "baz"
		}];
		exp = [];
		assertEquals([{mark:"foo",tag:"XXX"}],Algol.utils.collectPotentialMarks(markdefs,selmarks,artifacts));
	},
	"test should exclude same square for already selected mark": function(){
		var markdefs, selmarks, artifacts, exp;
		markdefs = {
			foo: {
			}
		};
		selmarks = [];
		artifacts = [{
			x: 1,
			y: 1,
			mark: "foo"
		},{
			x:1,
			y:1,
			mark:"foo"
		}];
		exp = [];
		assertEquals([{mark:"foo",x:1,y:1}],Algol.utils.collectPotentialMarks(markdefs,selmarks,artifacts));
	}
});

TestCase("CollectPotentialCommands",{
	"test should be defined": function(){
		assertFunction(Algol.utils.collectPotentialCommands);
	},
	"test should return nothing if no matches": function(){
		var cmnddefs, selmarks, artifacts, exp, res;
		cmnddefs = {};
		selmarks = [];
		artifacts = [];
		exp = [];
		res = Algol.utils.collectPotentialCommands(cmnddefs,selmarks,artifacts);
		assertEquals(exp,res);
	},
	"test should return nothing if reqs aren't met": function(){
		var cmnddefs, selmarks, artifacts, exp, res;
		cmnddefs = {
			foo: {
				name: "foo",
				requiremark: "bar"
			}
		};
		selmarks = [{mark:"baz"}];
		artifacts = [];
		exp = [];
		res = Algol.utils.collectPotentialCommands(cmnddefs,selmarks,artifacts);
		assertEquals(exp,res);
	},
	"test should return mark if reqs are met": function(){
		var cmnddefs, selmarks, artifacts, exp, res;
		cmnddefs = {
			foo: {
				name: "foo",
				requiremark: "bar"
			},
			baz: {
				requiremark: "biz"
			}
		};
		selmarks = [{mark:"bar"}];
		artifacts = [];
		exp = [{
			name: "foo",
			requiremark: "bar"
		}];
		res = Algol.utils.collectPotentialCommands(cmnddefs,selmarks,artifacts);
		assertEquals(exp,res);
	}
});

TestCase("Tester function",{
	"test should be defined": function(){
		assertFunction(Algol.cauldron.tester);
	},
	"test should run single query properly": function(){
		var cauldron, query, res, exp;
		cauldron = {
			foo: [{
				bar: "baz",
				x:8,
				y:9
			},{
				bar: "biz"
			},{
				moo: "buz"
			},{
				bar: "baz",
				moo: "bez"
			}]
		};
		query = {
			from: "foo",
			props: {
				bar: "baz"
			}
		};
		exp = [{
			bar: "baz",
			x: 8,
			y: 9
		},{
			bar: "baz",
			moo: "bez"
		}];
		res = Algol.cauldron.tester(cauldron,query,{});
		assertEquals(exp,res);
	},
	"test should run normal AND test properly": function(){
		var cauldron, test, query1, query2, res, exp;
		cauldron = {
			foo: [{
				moo: "bez",
				pee: "moo",
				x: 1,
				y: 5
			},{
				bar: "baz",
				moo: "bez",
				blah: "bluh",
				x: 2,
				y: 2
			}],
			foofoo: [{
				bar: "baz",
				moo: "bez",
				fee: "fuu",
				x: 2,
				y: 2
			}]
		};
		query1 = {
			from: "foo",
			props: {
				bar: "baz"
			}
		};
		query2 = {
			from: "foofoo",
			props: {
				moo: "bez"
			}
		};
		test = {
			tests: [query1,query2]
		};
		exp = [{
			bar: "baz",
			moo: "bez",
			blah: "bluh",
			fee: "fuu",
			x: 2,
			y: 2
		}];
		res = Algol.cauldron.tester(cauldron,test,{});
		assertEquals(exp,res);
	},
	"test should run OR test properly": function(){
		var cauldron, test, query1, query2, res, exp;
		cauldron = {
			foo: [{
				moo: "bez",
				pee: "moo",
				x: 1,
				y: 5
			},{
				bar: "baz",
				moo: "bez",
				blah: "bluh",
				x: 2,
				y: 2
			}],
			foofoo: [{
				bar: "baz",
				moo: "bez",
				fee: "fuu",
				x: 2,
				y: 2
			}]
		};
		query1 = {
			from: "foo",
			props: {
				pee: "moo"
			}
		};
		query2 = {
			from: "foofoo",
			props: {
				moo: "bez"
			}
		};
		test = {
			tests: [query1,query2],
			or: true
		};
		exp = [{
			bar: "baz",
			moo: "bez",
			fee: "fuu",
			x: 2,
			y: 2
		},{
			moo: "bez",
			pee: "moo",
			x: 1,
			y: 5
		}];
		res = Algol.cauldron.tester(cauldron,test,{});
		assertEquals(exp,res);
	},
	"test should honour except list": function(){
		var cauldron, test, query1, query2, res, exp;
		cauldron = {
			foo: [{
				moo: "bez",
				pee: "moo",
				x: 1,
				y: 5
			},{
				bar: "baz",
				moo: "bez",
				blah: "bluh",
				x: 2,
				y: 2
			}],
			foofoo: [{
				bar: "baz",
				moo: "bez",
				fee: "fuu",
				x: 2,
				y: 2
			}]
		};
		query1 = {
			from: "foo",
			props: {
				moo: "bez"
			}
		};
		query2 = {
			from: "foofoo",
			props: {
				moo: "bez"
			}
		};
		test = {
			tests: [query1],
			except: query2
		};
		exp = [{
			moo: "bez",
			pee: "moo",
			x: 1,
			y: 5
		}];
		res = Algol.cauldron.tester(cauldron,test,{});
		assertEquals(exp,res);
	}
});

TestCase("Querier",{
	"test should be defined": function(){
		assertFunction(Algol.cauldron.querier);
	},
	"test should work": function(){
		var cauldron, query, res, exp;
		cauldron = {
			foo: [{
				bar: "baz"
			},{
				bar: "biz"
			},{
				moo: "buz"
			},{
				bar: "baz",
				moo: "bez"
			}]
		};
		query = {
			from: "foo",
			props: {
				bar: "baz"
			}
		};
		exp = [{
			bar: "baz"
		},{
			bar: "baz",
			moo: "bez"
		}];
		res = Algol.cauldron.querier(cauldron,query,{});
		assertEquals(exp,res);
	},
	"test if cauldron is single array, should always use that no matter what from prop says": function(){
		var cauldron, query, res, exp;
		cauldron = [{
			bar: "baz"
		}];
		query = {
			from: "foo",
			props: {
				bar: "baz"
			}
		};
		exp = [{
			bar: "baz"
		}];
		res = Algol.cauldron.querier(cauldron,query,{});
		assertEquals(exp,res);
	},
	"test should account for multipos props": function(){
		var cauldron, query, res, exp;
		cauldron = {
			foo: [{
				bar: "baz",
				x: 2,
				y: 3
			}]
		};
		query = {
			from: "foo",
			props: {
				bar: ["boo","baz","bin"]
			}
		};
		exp = [{
			bar: "baz",
			x: 2,
			y: 3
		}];
		res = Algol.cauldron.querier(cauldron,query,{});
		assertEquals(exp,res);
	},
	"test should account for vars": function(){
		var cauldron, query, res, exp, vars;
		cauldron = {
			foo: [{
				plr: "1",
				x: 2,
				y: 3
			}]
		};
		query = {
			from: "foo",
			props: {
				plr: "CURRENTPLAYER"
			}
		};
		vars = {
			"CURRENTPLAYER": 1
		};
		exp = [{
			plr: "1",
			x: 2,
			y: 3
		}];
		res = Algol.cauldron.querier(cauldron,query,vars);
		assertEquals(exp,res);
	}
});
