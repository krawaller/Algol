
GAME = { // versionspecific object? 
	boards: {
		BOARDID: {
			height: NUMBER,
			width: NUMBER,
			terrain: [{
				x: NUMBER,
				y: NUMBER,
				terrain: STRING // and plr, dir, whatever you want. or just these?
			}]
		}
	},
	terrain: { // optional, use if want to spam terrainobjs with typespecific props
		TERRAINID: {
			foo: "bar"
		}
	},
	setups: {
		SETUPID: {
			UID: {
				uid: uid,
				x: NUMBER,
				y: NUMBER,
				dir: DIR,
				status: STATUS,
				unit: UNITID
			}
		}
	},
	units: { // optional?, use if u want to spam unitobjs with typespecific props
		UNITID: {
			desc: STRING
		}
	},
	marks: {
		MARKID: {
			where: T, // optional? or skip potmark concept?
			requirements: {
				mark: MARKID
			}
		}
	},
	winconditions: {
		counts: [{ // only counts, or need support for more types?
			test: T,
			ifnot: NUMBER
		}]
	},
	endturnconditions: { // support for different phases?
		actionpointsspent: NUMBER
	},
	commands: {
		CMNDID: {
			requirements: {
				mark: MARKID
			},
			ui: {
				name: NAME,
				button: DIR,
				buttonrelsourceunitdir: BOOLEAN
			},
			effects: { // GAH! sourceunit shit! how calculate! 
				increasescoreby: NUMBER, // variables here! 
				board: [{
					where: T || MARKID,
					unit: {
						moveto: MARKID,
						setstatusto: STATUS
					},
					terrain: {
						setstatusto: STATUS
					}
				}]
			}
		}
	},
	artifactgenerators: {
		AID: {
			aid: AID,
			type: TYPE, // walker or offset or spawn
			prio: NUMBER,
			when: WHEN // turn or cmnd or mark
		},
		WALKER: {
			starts: T,
			steps: T, // optional
			stops: T, // should be optional!
			createatstep: BOOLEAN,
			createatstop: BOOLEAN,
			steptag: TAG,
			stoptag: TAG,
			stepmark: MARKID,
			stopmark: MARKID  // rethink this whole shit!
		},
		OFFSET: {
			starts: T,
			dirs: [DIR,DIR],
			forward: NUMBER,
			right: NUMBER,
			tag: TAG,
			mark: MARKID // rethink!
		},
		SPAWN: {
			where: T,
			tag: TAG,
			mark: MARKID // rethink!
		}
	},
	tests: {
		TESTID: {
			tests: [T,T],
			or: BOOLEAN,
			except: T
		}
	},
	queries: {
		QUERYID: {
			from: BOWLNAME,
			props: {
				PROPNAME: PROPVALUE || [PROPVALUE,PROPVALUE]
			}
		}
	}
};
