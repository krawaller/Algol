
BATTLE = {
	game: GAMEID,
	board: BOARDID,
	setup: SETUPID,
	players: [NAME,NAME,NAME],
	battlestates: {
		units: {
			UNITID: {
				PROPERTYID: [[TIME,PROPERTYVALUE]]
			}
		},
		board: {
			YKX: {
				PROPERTYID: [[TIME,PROPERTYVALUE]]
			}
		},
		moves: {
			TIME: {
				plr: PLAYER,
				cmnd: COMMANDID,
				marks: {
					MARKID: {
						x: NUMBER,
						y: NUMBER,
						what: STRING // unittype || "square" (?)
					}
				}
			}
		}
	},
	turnstates: {
		startedat: TIME,
		player: PLAYER,
		nextstep: NUMBER,
		units: {
			UNITID: {
				PROPERTYID: [[TIME,PROPERTYVALUE]]
			}
		},
		board: {
			YKX: {
				PROPERTYID: [[TIME,PROPERTYVALUE]]
			}
		},
		moves: {
			TIME: {
				plr: PLAYER,
				cmnd: COMMANDID,
				marks: {
					MARKID: {
						x: NUMBER,
						y: NUMBER,
						affectedunits: [],
						what: STRING // unittype || "square" (?)
					}
				},
				actionpoints: NUMBER
			}
		}
	}
};

/*
 * Turnbits: 
 * Have to feed the turnstates into the bowlcollector too!
 * Really need two different? No! Just store in turnstate which step it starts!
 * Reverttime(time): on stateobject, delete all moves and propertychanges above target time
 * Deletemove(time): on stateobject, delete said move, and change all timestamps above that to one below what it was
 * DeleteUnitMoves(uid): delete all moves affecting said unit, and flatten out timestamps
 * Undo button - simple, just revert time to previous step
 * 
 */
