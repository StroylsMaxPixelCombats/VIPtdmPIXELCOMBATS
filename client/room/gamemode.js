import { DisplayValueHeader, Color } from 'pixel_combats/basic';
import { Game, Players, Inventory, LeaderBoard, BuildBlocksSet, Teams, Damage, BreackGraph, Ui, Properties, GameMode, Spawns, Timers, TeamsBalancer, NewGameVote, NewGame } from 'pixel_combats/room';

// Константы:
var WaitingPlayersTime = 6;
var BuildBaseTime = 31;
var GameModeTime = 601;
var EndOfMatchTime = 11;
var ConetsTime = 11;

// Константы, имён:
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";
var ConetsStateValue = "ConetsMode";

// Постоянные - переменные:
var mainTimer = Timers.GetContext().Get("Main");
var stateProp = Properties.GetContext().Get("State");

// Применяем параметры, создания - комнаты:
Damage.FriendlyFire = GameMode.Parameters.GetBool("FriendlyFire");
Map.Rotation = GameMode.Parameters.GetBool("MapRotation");
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");

// Блок игрока, всегда - усилен:
BreackGraph.PlayerBlockBoost = true;

// Параметры, игры:
Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = mainTimer.Id;
// Стандартные, команды:
Teams.Add("Blue", "<b><size=30><color=#0d177c>ß</color><color=#03088c>l</color><color=#0607b0>ᴜ</color><color=#1621ae>E</color></size></b>", new Color(0, 0, 1, 0));
Teams.Add("Red", "<b><size=30><color=#962605>尺</color><color=#9a040c>ᴇ</color><color=#b8110b>D</color></size></b>", new Color(1, 0, 0, 0));
Teams.Add("Yellow", "<b><size=30><color=#c67217>Ѵ</color><color=#c68f14>ł</color><color=#c6ac11>Ҏ</color></size></b>", new Color(1, 1, 0, 0));
var BlueTeam = Teams.Get("Blue");
var RedTeam = Teams.Get("Red");
var VipTeam = Teams.Get("Yellow");
BlueTeam.Spawns.SpawnPointsGroups.Add(1);
VipTeam.Spawns.SpawnPointsGroups.Add(3);
RedTeam.Spawns.SpawnPointsGroups.Add(2);
BlueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
VipTeam.contextedProperties.SkinType.Value = 2;
VipTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
RedTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;

// Максимальные - смерти, команд:
var MaxDeaths = Players.MaxCount * 5;
Teams.Get("Red").Properties.Get("Deaths").Value = MaxDeaths;
Teams.Get("Yellow").Properties.Get("Deaths").Value = MaxDeaths;
// Стандартные - лидерБорды:
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Kills",
		DisplayName: "У:",
		ShortDisplayName: "У:"
	},
	{
		Value: "Deaths",
		DisplayName: "С:",
		ShortDisplayName: "С:"
	},
	{
		Value: "Spawns",
		DisplayName: "С:",
		ShortDisplayName: "С:"
	},
	{
		Value: "Scores",
		DisplayName: "О:",
		ShortDisplayName: "О:"
	}
];
LeaderBoard.TeamLeaderBoardValue = {
	Value: "Deaths",
	DisplayName: "Statistics\Deaths",
	ShortDisplayName: "Statistics\Deaths"
};
// Вес - команды, в лидерБорде:
LeaderBoard.TeamWeightGetter.Set(function(Team) {
	return Team.Properties.Get("Deaths").Value;
});
// Вес - игрока, в лидерБорде:
LeaderBoard.PlayersWeightGetter.Set(function(Player) {
	return Player.Properties.Get("Kills").Value;
});

// Задаём, что выводить, в табе:
Ui.GetContext().TeamProp1.Value = { Team: "Blue", Prop: "Deaths" };
Ui.GetContext().TeamProp2.Value = { Team: "Red", Prop: "Deaths" };

// Задаём, зайти игроку - в команду:
Teams.OnRequestJoinTeam.Add(function(Player,Team){Team.Add(Player);});
// Задаём, заспавнится игроку - в команду: 
Teams.OnPlayerChangeTeam.Add(function(Player){ Player.Spawns.Spawn()});

// Делаем игроков, неуязвимыми - после спавна:
var immortalityTimerName="immortality";
Spawns.GetContext().OnSpawn.Add(function(Player){
	Player.Properties.Immortality.Value=true;
	timer=Player.Timers.Get(immortalityTimerName).Restart(5);
});
Timers.OnPlayerTimer.Add(function(Timer){
	if(Timer.Id!=immortalityTimerName) return;
	Timer.Player.Properties.Immortality.Value=false;
});

// После каждой - смерти игрока, отнимаем одну - смерть, в команде:
Properties.OnPlayerProperty.Add(function(Context, Value) {
	if (Value.Name !== "Deaths") return;
	if (Context.Player.Team == null) return;
	Context.Player.Team.Properties.Get("Deaths").Value--;
});
// Если у игрока - занулилились смерти, то завершаем игру:
Properties.OnTeamProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (value.Value <= 0) SetEndOfMatchMode();
});

// Счётчик - спавнов:
Spawns.OnSpawn.Add(function(Player) {
	++Player.Properties.Spawns.Value;
});
// Счётчик - смертей:
Damage.OnDeath.Add(function(Player) {
	++Player.Properties.Deaths.Value;
	Spawns.GetContext().Despawn();
	Player.contextedProperties.SkinType.Value = 1;
	Player.Ui.Hint.Value = "!Ожидайте, конец - матча!";
	if (VipTeam.Properties.Deaths.Value == 1) {
	   SetEnd0fMatchRedTeam();
});
// Счётчик - убийствов:
Damage.OnKill.Add(function(Player, Killed) {
	if (Killed.Team != null && Killed.Team != Player.Team) {
		++Player.Properties.Kills.Value;
		Player.Properties.Scores.Value += 100;
	}
    }
});

// Переключение - игровых, режимов:
mainTimer.OnTimer.Add(function() {
	switch (stateProp.Value) {
	case WaitingStateValue:
		SetBuildMode();
		break;
	case BuildModeStateValue:
		SetGameMode();
		break;
	case GameStateValue:
		SetEndOfMatchMode();
		break;
	case EndOfMatchStateValue:
		SetConets();
		break;
	case ConetsStateValue:
		RestartGame();
		break;
	}
});

// Задаём, первое игровое - состояние игры:
SetWaitingMode();

// Состояние, игры:
function SetWaitingMode() {
	stateProp.Value = WaitingStateValue;
	Ui.GetContext().Hint.Value = "Ожидание, игроков...";
	Spawns.GetContext().Enable = false;
	mainTimer.Restart(WaitingPlayersTime);
}

function SetBuildMode() 
{
	BlueTeam.Ui.Hint.Value = "!Подготовьтесь, защищать - випа!";
	VipTeam.Ui.Hint.Value = "!Следуйте, за охраной/или - прячьтесь!";
	RedTeam.Ui.Hint.Value = "!Подготовьтесь, убивать - випа!";
	stateProp.Value = BuildModeStateValue;
	Ui.GetContext().Hint.Value = "";
	var inventory = Inventory.GetContext();
	if (GameMode.Parameters.GetBool("MeleeVip") {
	VipTeam.inventory.Melee.Value = true;
	}
	inventory.Main.Value = false;
	inventory.Secondary.Value = false;
	BlueTeam.inventory.Melee.Value = true;
	RedTeam.inventory.Melee.Value = true;
	inventory.Explosive.Value = false;
	inventory.Build.Value = true;
	BlueTeam.inventory.Secondary.Value = true;
	RedTeam.inventory.Secondary.Value = true;

	mainTimer.Restart(BuildBaseTime);
	Spawns.GetContext().Enable = true;
	SpawnTeams();
}
function SetGameMode() 
{
	stateProp.Value = GameStateValue;
	BlueTeam.Ui.Hint.Value = "!Защищайте, випа!";
	RedTeam.Ui.Hint.Value = "!Убейте - випа!";
        VipTeam.Ui.Hint.Value = "!Следуй, за охраной/или - прячься!";

if (GameMode.Parameters.GetBool("MeleeVip") {
	VipTeam.inventory.Melee.Value = true;
}
	BlueTeam.inventory.Main.Value = true;
	BlueTeam.inventory.Secondary.Value = true;
	BlueTeam.inventory.Melee.Value = true;
	BlueTeam.inventory.Build.Value = true;
	RedTeam.inventory.Main.Value = true;
	RedTeam.inventory.Secondary.Value = true;
	RedTeam.inventory.Melee.Value = true;
	RedTeam.inventory.Build.Value = true;
	VipTeam.inventory.Main.Value = false;
        VipTeam.inventory.Secondary.Value = false;
	VipTeam.inventory.Melee.Value = false;
	VipTeam.inventory.Build.Value = false;
	

	mainTimer.Restart(GameModeTime);
	Spawns.GetContext().Spawn();
	SpawnTeams();
}	
function SetEndOfMatchMode() {
	stateProp.Value = EndOfMatchStateValue;
	Ui.GetContext().Hint.Value = "!Время, вышло/Вип и синие, победили!";
          BlueTeam.Properties.Scores.Value += 1000;
	  BlueTeam.Properties.Kills.Value += 1000;
	    VipTeam.Properties.Scores.Value += 1000;
	    VipTeam.Properties.Kills.Value += 1000;
	RedTeam.Properties.Scores.Value -= 1000;
	RedTeam.Properties.Kills.Value = -= 1000;

	var inventory = Inventory.GetContext();
	inventory.Main.Value = false;
	inventory.Secondary.Value = false;
	inventory.Melee.Value = false;
	inventory.Explosive.Value = false;
	inventory.Build.Value = false;
	
	mainTimer.Restart(EndOfMatchTime);
}
function SetEnd0fMatchRedTeam() {
	stateProp.Value = EndOfMatchStateValue;
	Ui.GetContext().Hint.Value = "!Красные - победили, вип убит!";
	BlueTeam.Properties.Scores.Value -= 1000;
	BlueTeam.Properties.Kills.Value -= 1000;
	    VipTeam.Properties.Scores.Value -= 1000;
	    VipTeam.Properties.Kills.Value = -= 1000;
	RedTeam.Properties.Scores.Value += 1000;
	RedTeam.Properties.Kills.Value += 1000;

	var inventory = Inventory.GetContext();
	inventory.Main.Value = false;
	inventory.Secondary.Value = false;
	inventory.Melee.Value = false;
	inventory.Explosive.Value = false;
	inventory.Build.Value = false;
	
	mainTimer.Restart(End0fMatchTime);
	
}
function SetConets() {
	stateProp.Value = ConetsStateValue;
	mainTimer.Restart(ConetsTime);

	Spawns.GetContext().Enable = false;
	Spawns.GetContext().Despawn();
	Game.GameOver(LeaderBoard.GetTeams());
}
function RestartGame() {
	Game.RestartGame();
}
function SpawnTeams() {
	var Teams = Teams.Spawn();
	 Teams.GetContext().Spawn();		
    } 
