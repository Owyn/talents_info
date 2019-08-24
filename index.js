module.exports = function talentsinfo(mod) {
	const command = mod.command || mod.require.command;
	const softcap = 0.8901403358192;
	let warned = false;
	let lvl = 0,
		exp = 0,
		dexp = 0,
        dcap = 0,
		sdcap = 0;

    // message on command
    command.add(['talent', 'talents', 'EP', '!EP'], msg);

    // send message exp/cap (exp%)
    function msg()
	{
        command.message(`<font color="#FDD017">info:</font> LVL <font color="#00FFFF">${lvl}</font>, EXP: <font color="#00FFFF">${exp}</font>, DailyEXP <font color="#00FFFF">${dexp}/${sdcap} (${Math.round(100*dexp/sdcap)}%) </font>`);
	}
	
	mod.hook('S_LOAD_EP_INFO', 1, event=>{
		exp = event.exp;
		lvl = event.level;
		dexp = event.dailyExp;
		dcap = event.dailyExpMax;
		sdcap = Math.floor(dcap*softcap);
	});
	
	mod.hook('S_CHANGE_EP_EXP_DAILY_LIMIT', 1, event=>{
		dcap = event.limit;
		sdcap = Math.floor(dcap*softcap);
	});
	
	mod.hook('S_PLAYER_CHANGE_EP', 'raw', (code, data)=>{
		let gained = data.readInt32LE(4);
		exp = data.readInt32LE(8); // 64 actually but this should be enough
		lvl = data.readInt32LE(16);
		dexp = data.readInt32LE(20);
		dcap = data.readInt32LE(24);
		sdcap = Math.floor(dcap*softcap);
		let scmod = Math.round(data.readFloatLE(37) * 100);
		if(gained)
		{
			if(dexp >= sdcap)
			{
				if(!warned)
				{
					command.message('<font color="#FDD017">EXP</font> Daily Cap <font color="#FF0000">reached!</font>');
					warned = true;
				}
			}
			else
			{
				warned = false;
			}
			command.message('<font color="#00FFFF">+' + gained + ' EXP</font>' + (!warned ? ' (' + dexp + ' / ' + sdcap + ' (Daily Cap), <font color="#FFF380">' + (sdcap-dexp) + '</font> EXP left for today uncapped)' : ' (' + scmod + '% mod)' ));
		}
	});
	
	// open EP ui
    mod.hook('C_REQUEST_CONTRACT', 1, event => {
        if (event.type == (mod.majorPatchVersion >= 85 ? 78 : 77))
		{
            msg();
        }
	});
};
