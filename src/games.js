	
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
				}
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
				}
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