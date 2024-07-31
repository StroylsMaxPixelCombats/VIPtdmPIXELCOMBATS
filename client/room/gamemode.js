import { DisplayValueHeader, Color } from 'pixel_combats/basic';
import { Players, Inventory, GameMode, Game, Properties, BuildBlocksSet, Build, Teams, Timers, Ui, Spawns, LeaderBoard, TeamsBalancer, AreaPlayerTriggerService, AreaViewService } from 'pixel_combats/room';

// Создаём - команды
Teams.Add("Blue", "<b> |[<< •ИГРОКИ• >>]| v1.1.0 | <color=Lime>PLAYERS</a></b>", new Color(0, 0, 1, 0));
Teams.Add("Red", "<b> |[<< •АДМИНЫ• >>]| v1.1.0 | <color=Red>ADMINS</a></b>", new Color(1, 0, 0, 0));
var PlayersTeam = Teams.Get("Blue");
var AdminsTeam = Teams.Get("Red");
PlayersTeam.Spawns.SpawnPointsGroups.Add(1);
PlayersTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
AdminsTeam.Spawns.PointsGroups.Add(2);
AdminsTeam.Build.BlocksSet.Value = BuildBlocksSet.AllClear;
// Настройки 
Damage.GetContext().DamageOut.Value = true;
Damage.GetContext().FriendlyFire.Value = true;
BreackGraph.OnlyPlayerBlocksDmg.Value = true;
// Создаём - лидерБорды
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Kills",
		DisplayName: "<b><color=Lime>КИЛЛЫ</a></b>",
		ShortDisplayName: "<b><color=Red>КИЛЛЫ</a></b>"
	},
	{
		Value: "Deaths",
		DisplayName: "<b><color=Lime>СМЕРТИ</a></b>",
		ShortDisplayName: "<b><color=Red>СМЕРТИ</a></b>"
	},
	{
		Value: "Scores",
		DisplayName: "<b><color=Lime>МОНЕТЫ</a></b>",
		ShortDisplayName: "<b><color=Red>МОНЕТЫ</a></b>"
	},
	{
		Value: "Status",
		DisplayName: "<b><color=Lime>СТАТУС</a></b>",
		ShortDisplayName: "<b><color=Red>СТАТУС</a></b>"
	}
	
];
LeaderBoard.TeamLeaderBoardValue = {
	Value: "Deaths",
	DisplayName: "<b><color=Lime>СМЕРТИ</a></b>",
	ShortDisplayName: "<b><color=Red>СМЕРТИ</a></b>"
};

// Создаём - лидерБорд: Монет
LeaderBoard.PlayersWeightGetter.Set(function(Player) {
  return Player.Properties.Get("Scores").Value;
});
// Создаём - Команду: Спавнов
Teams.OnPlayerChangeTeam.Add(function(Player){ 
  Player.Spawns.Spawn();
});
// Создаём - Счётчик: Смертей
Damage.OnDeath.Add(function(Player) {
  ++Player.Properties.Deaths.Value;
});
// Создаём - Счётчик: Киллов
Damage.OnKill.Add(function(Player, Killed) {
  if (Player.id !== Killed.id) { 
    ++Player.Properties.kills.Value;
    Player.Properties.Scores.Value += 150;
  }
});
// После спавна - игроки: Неуязвимы, до 10 секунд
var immortalityTimerName = "immortality";
Spawns.GetContext().OnSpawn.Add(function(Player, Timer){
  Player.Properties.Immortality.Value = true;
  Timer = Player.Timers.Get(immortalityTimerName).Restart(10);
});
Timers.OnPlayerTimer.Add(function(Timer){
  if (Timer.Id != immortalityTimerName) return;
  Timer.Player.Properties.Immortality.Value = false;
});

// Задаём, что будет на - вверху
var Des = "<b>|[<<color=Lime>< •v.1.10• ></a>>]|</b>";
var Sed = "<b>|[<< •<color=Lime>TORGOVLL</a>• >>]|</b>";
Teams.Get("Red").Properties.Get("Des").Value = Sed;
Ui.GetContext().TeamProp1.Value = { Team: "Red", Prop: "Des" };
Ui.GetContext().TeamProp2.Value = { Team: "Blue", Prop: "Sed" };
Teams.Get("Blue").Properties.Get("Sed").Value = Des;

// Игровой - Инвентарь: Конфигурация
var Inventory = Inventory.GetContext();
Teams.Inventory.("Blue").Main.Value = false;
Teams.Inventory.("Blue").Secondary.Value = false;
Teams.Inventory.("Blue").Melee.Value = false;
Teams.Inventory.("Blue").Explosive.Value = false;
Teams.Inventory.("Blue").Build.Value = false;
// Таймер - спавна: 3 секунды
Spawns.GetContext().RespawnTime.Value = 3;
// Приветствие - игрокам: всем
Ui.GetContext().Hint.Value = Player + " Здравствуйте!";

// Зона покупки: фарма по 100
var Plus100







