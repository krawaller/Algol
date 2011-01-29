
BATTLE = {
	game: GAMEID,
	players: [NAME,NAME,NAME],
	moves: [{
		plr: PLAYER,
		cmnd: COMMANDID,
		marks: {
			MARKID: {
				x: NUMBER,
				y: NUMBER,
				what: STRING // unittype ||Ê"square" (?)
			}
		}
	}],
	states: {
		units: {
			UNITID: {
				PROPERTYID: [[TIME,PROPERTYVALUE]]
			}
		},
		board: {
			YKX: {
				PROPERTYID: [[TIME,PROPERTYVALUE]]
			}
		}
	}
};
