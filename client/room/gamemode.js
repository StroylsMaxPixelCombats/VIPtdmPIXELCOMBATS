// АПИ - РОБОТЫ
import { DisplayValueHeader, Color } from 'pixel_combats/basic';
import { Inventory, Players, Game, GameMode, Teams, Properties, BuildBlocksSet, TeamsBalancer, Damage, BreackGraph, Ui } from 'pixel_combats/room';

// КОНСТАНТЫ
var WaitingPlayersTime = 30;
var BuildBaseTime = 15;
var GameModeTime = 140;
var EndOfMatchTime = 10;

// КОНСТАНТЫ - ИМЁН
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";

// СОЗДАЁМ - КОМАНДЫ
Teams.Add("Blue", "<b>ПРЯЧУЩИЕ</b>", new Color(0, 0, 1, 0));
Teams.Add("Red", "<b>ИСКАТЕЛИ</b>", new Color(1, 0, 0, 0));
var TeamRed = Teams.Get("Red");
var TeamBlue = Teams.Get("Blue");
TeamRed.Build.BlocksSet.Value = BuildBlocksSet.Red;
TeamRed.Spawns.SpawnPointsGroups.Add(1);
TeamRed.ContextedProperties.SkinType.Value = 3;
TeamBlue.ContextedProperties.SkinType.Value = 2;
TeamBlue.Spawns.SpawnPointsGroups.Add(2);
TeamBlue.Build.BlocksSet.Value = BuildBlocksSet.Blue;
// НАСТРОЙКИ
Damage.GetContext().DamageOut.Value = true;
BreackGraph.OnlyPlayerBlocksDmg.Value = true;
BreackGraph.PlayerBlockBoost = true;
Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = mainTimer.Id;
// ПАРАМЕТРЫ
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("WeakBlocks");
Map.Rotation = GameMode.Parameters.GeyBool("MapRotation");
if (GameMode.Parameters.GetBool("500HPblue")) {
 TeamBlue.ContextedProperties.MaxHp.Value = 500;
}
if (GameMode.Parameters.GetBool("500HPred")) {
 TeamRed.ContextedProperties.MaxHp.Value = 500;
}
// ПОСТОЯННЫЕ ПЕРЕМЕННЫЕ
var mainTimer = Timers.GetContext().Get("Main");
var stateProp = Properties.GetContext().Get("State");
// СОЗДАЁМ - ЛИДЕРБОРДЫ








