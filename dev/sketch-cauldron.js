
CAULDRON = {
	units: {
		YKX: [{
			
		}]
	},
	artifacts: {
		YKX: [{
			
		}]
	},
	marks: {
		YKX: {
			
		}
	},
	terrain: {
		YKX: {
			
		}
	},
	allsquares: {
		YKX: [{
			
		}]
	}
};

TESTRESULT = {
	ykx: {
		// melded properties from all objects at position from bowls included in test
	} // , ...
};


/********
 * 
 *   meldobject! sameprop different vals means array
 * 
 *   Query: meld all matching objects.
 * 
 *   AND-test: if ykx in all lists fulfilled test, return melded obj 
 *   OR-test: if ykx from any list fulfilled test, return melded obj. Bah! Ignore? Leave for now.
 * 
 *   Artifact: works on TESTRESULT objects. Meld or merge to create artifact? Hah! Merge! I'm so clever. :)
 *   
 *   
 *   
 *   MARKMATCH TESTCASE
 *   
 *   Amazons all-at-once version.
 *      When marking unit:
 *        match only against MYUNITS
 *          markmatch contains uid
 *          make walkmatches along all dirs
 *      When marking walktarget
 *        match uid against mark uid
 *          walkmatch contains uid
 *          markmatch contains aseed
 *          make firematches along all dirs
 *      When marking firetarget
 *        match aseed against mark aseed (and uid against uid?)
 *        
 *   Conclusion - needs aseed functionality. Observe, different for each dir! And only if not in start? Hmm.
 *   And what actually needs to happen? The potential marksquare must be compared to currently made mark. So,
 *   a mark should be allowed to give a markid AND a... list of props that must match?
 *   
 *   This can only be done at mark time, though.
 *   
 *   marks: {
		MARKID: {
			where: T || MARKID, 
			requirements: {
				mark: MARKID,
				matchprops: []
			}
		}
	},
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 *   
 * 
 * 
 */