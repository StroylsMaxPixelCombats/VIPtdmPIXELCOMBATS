//var System = importNamespace('System');
import { DisplayValueHeader, Color } from 'pixel_combats/basic';
import { Game, Players, Inventory, LeaderBoard, BuildBlocksSet, Teams, Damage, BreackGraph, Ui, Properties, GameMode, Spawns, Timers, TeamsBalancer } from 'pixel_combats/room';
import * as default_timer from './default_timer.js';

// Константы
var WaitingPlayersTime = 20;
var BuildBaseTime = 15;
var GameModeTime = 140;
var EndOfMatchTime = 10;
var KnivesModeTime = 20;

// Константы, имён
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";
var KnivesModeStateValue = "KnivesMode";

// Постоянные, переменны
var mainTimer = Timers.GetContext().Get("Main");
var stateProp = Properties.GetContext().Get("State");

// Применяем параметры создания, комнаты
Damage.FriendlyFire = GameMode.Parameters.GetBool("FriendlyFire");
Map.Rotation = GameMode.Parameters.GetBool("MapRotation");
BreackGraph.OnlyPlayerBlocksDmg.Value = true;
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");

// Блок игрока всегда, усилен
BreackGraph.PlayerBlockBoost = true;

// Параметры игры
Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = mainTimer.Id;
// Создаём команды
Teams.Add("Blue", "<b>ПРЯЧУЩИЕ</b>", new Color(0, 0, 1, 0));
Teams.Add("Red", "<b>ИСКАТИЛИ</b>", new Color(1, 0, 0, 0));
var BlueTeam = Teams.Get("Blue");
var RedTeam = Teams.Get("Red");
BlueTeam.Spawns.SpawnPointsGroups.Add(1);
RedTeam.Spawns.SpawnPointsGroups.Add(2);
BlueTeam.ContextedProperties.SkinType.Value = 2; 
BlueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
RedTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;
// Задаём макс смертей, команд
var maxDeaths = Players.MaxCount * 5;
Teams.Get("Red").Properties.Get("Deaths").Value = maxDeaths;
Teams.Get("Blue").Properties.Get("Deaths").Value = maxDeaths;
// Задаём что выводить, в лидербордах
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Kills",
		DisplayName: "У",
		ShortDisplayName: "У"
	},
	{
		Value: "Deaths",
		DisplayName: "С",
		ShortDisplayName: "С"
	},
	{
		Value: "Spawns",
		DisplayName: "С",
		ShortDisplayName: "С"
	},
	{
		Value: "Scores",
		DisplayName: "О",
		ShortDisplayName: "О"
	}
];
LeaderBoard.TeamLeaderBoardValue = {
	Value: "Deaths",
	DisplayName: "С",
	ShortDisplayName: "С"
};
// Вес команды, в лидерборде
LeaderBoard.TeamWeightGetter.Set(function(team) {
	return team.Properties.Get("Deaths").Value;
});
// Вес игрока, в лидерборде
LeaderBoard.PlayersWeightGetter.Set(function(player) {
	return player.Properties.Get("Kills").Value;
});

// Задаём, что выводить вверху
Ui.GetContext().TeamProp1.Value = { Team: "Blue", Prop: "Deaths" };
Ui.GetContext().TeamProp2.Value = { Team: "Red", Prop: "Deaths" };

// Разрешаем вход в команды, по запросу
Teams.OnRequestJoinTeam.Add(function(player,team){team.Add(player);});
// Спавн, по входу в команду
Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()});

// Делаем игроков неуязвимыми, после спавна
var immortalityTimerName="immortality";
Spawns.GetContext().OnSpawn.Add(function(player){
	Player.Properties.Immortality.Value=true;
	timer=Player.Timers.Get(immortalityTimerName).Restart(7);
});
Timers.OnPlayerTimer.Add(function(timer){
	if(timer.Id!=immortalityTimerName) return;
	timer.Player.Properties.Immortality.Value=false;
});

// После каждой смерти игрока, отнимаем одну смерть в команде
Properties.OnPlayerProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (context.Player.Team == null) return;
	context.Player.Team.Properties.Get("Deaths").Value--;
});
// Если в команде количество смертей занулилось, то завершаем игру
Properties.OnTeamProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (value.Value <= 0) SetEndOfMatchMode();
});

// Счётчик, спавнов
Spawns.OnSpawn.Add(function(player) {
	++player.Properties.Spawns.Value;
});
// Счётчик, смертей
Damage.OnDeath.Add(function(player) {
	++player.Properties.Deaths.Value;
});
// Счётчик, убийств
Damage.OnKill.Add(function(player, killed) {
	if (killed.Team != null && killed.Team != player.Team) {
		++player.Properties.Kills.Value;
		player.Properties.Scores.Value += 100;
	}
});

// Настройка переключения, режимов
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
		RestartGame();
		break;
	}
});

//  Задаём первое игровое, состояние
SetWaitingMode();

// Состояние игры
function SetWaitingMode() {
	stateProp.Value = WaitingStateValue;
	Ui.GetContext().Hint.Value = "!Ожидание, пряток...!";
	Spawns.GetContext().Enable = true;
	mainTimer.Restart(WaitingPlayersTime);

var inventory = Inventory.GetContext();
 BlueTeam.inventory.Main.Value = false;
 BlueTeam.inventory.Secondary.Value = false;
 BlueTeam.inventory.Melee.Value = false;
 BlueTeam.inventory.Explosive.Value = false;
 BlueTeam.inventory.Build.Value = false;
} else {
 RedTeam.inventory.Main.Value = true;
 RedTeam.inventory.Secondary.Value = true;
 RedTeam.inventory.Melee.Value = true;
 RedTeam.inventory.Explosive.Value = true;
 RedTeam.inventory.Build.Value = true;
 
}

function SetBuildMode() 
{
	stateProp.Value = BuildModeStateValue;
	BlueTeam.Ui.Hint.Value = "!Искатели готовятся, искать!";
 RedTeam.Ui.Hint.Value = "!прячущие готовятся, прятаться!";
	var inventory = Inventory.GetContext();
	 BlueTeam.inventory.Main.Value = false;
  BlueTeam.inventory.Secondary.Value = false;
 	BlueTeam.inventory.Melee.Value = true;
 	BlueTeam.inventory.Explosive.Value = false;
 	BlueTeam.inventory.Build.Value = false;  
} else {
  RedTeam.inventory.Main.Value = false;
  RedTeam.inventory.SecondaryInfinity.Value = true;
  RedTeam.inventory.Secondary.Value = true;
 	RedTeam.inventory.Melee.Value = true;
 	RedTeam.inventory.Explosive.Value = false;
 	RedTeam.inventory.Build.Value = false;

	mainTimer.Restart(BuildBaseTime);
	Spawns.GetContext().enable = true;
	SpawnTeams();
}
function SetGameMode() 
{
	stateProp.Value = GameStateValue;
	BlueTeam.Ui.Hint.Value = "!Прячьтесь!";
 RedTeam.Ui.Hint.Value = "!Ищите, прячущих!";

	var inventory = Inventory.GetContext();
	if (GameMode.Parameters.GetBool("OnlyKnives")) {
		inventory.Main.Value = false;
		inventory.Secondary.Value = false;
		inventory.Melee.Value = true;
		inventory.Explosive.Value = false;
		inventory.Build.Value = true;
	} else {
		RedTeam.inventory.Main.Value = true;
  RedTeam.inventory.MainInfinity.Value = true;
		RedTeam.inventory.Secondary.Value = true;
  RedTeam.inventory.SecondaryInfinity.Value = true;
		RedTeam.inventory.Melee.Value = true;
  RedTeam.inventory.ExplosiveInfinity.Value = true;
		RedTeam.inventory.Explosive.Value = true;
		RedTeam.inventory.Build.Value = false;
	}

	mainTimer.Restart(GameModeTime);
	Spawns.GetContext().Spawn();
	SpawnTeams();
}
function SetEndOfMatchMode() {
	if(stateProp.Value !== "Game")return; 
Teams.Get("Blue").Properties.Get("Deaths").Value = BlueTeam.Deaths - 1; 
Teams.Get("Red").Properties.Get("Deaths").Value = redTeam.GetAlivePlayersCount() - 0; 
 if(blueTeam.GetAlivePlayersCount() == 1) { 
  Ui.GetContext().Hint.Value = "МАНЬЯК ВЫИГРАЛ"; 
  SetEndOfMatchMode(); 
 } 
} 
function RestartGame() {
  Game.RestartGame();
}

function SpawnTeams() {
var Spawns = Teams.Spawn();
  Spawns.GetContext().Spawn();
  }
