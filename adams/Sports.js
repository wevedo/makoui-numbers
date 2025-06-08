const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const moment = require("moment-timezone");

const apiKey = '7b6507c792f74a2b9db41cfc8fd8cf05'; // Replace with your actual API key
const apiUrl = 'https://api.football-data.org/v4';

// Helper function to fetch data from the API
const fetchFootballData = async (endpoint) => {
  try {
    const response = await axios.get(`${apiUrl}/${endpoint}`, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/** ✅ Ligue 1 Standings */
adams({
  nomCom: "l1",
  categorie: "Football",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  const data = await fetchFootballData('competitions/FL1/standings');
  if (!data || !data.standings) {
    return repondre("❌ Error fetching Ligue 1 standings.");
  }

  const standings = data.standings[0].table;
  let standingsMessage = "📊 *Ligue 1 Table*\n\n";
  standings.slice(0, 10).forEach((team, index) => {
    standingsMessage += `${index + 1}. ${team.team.name} - ${team.points}P (${team.playedGames}G)\n`;
  });

  repondre(standingsMessage);
});

/** ✅ Ligue 1 Matches */
adams({
  nomCom: "l1m",
  categorie: "Football",
  reaction: "📅"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  const data = await fetchFootballData('competitions/FL1/matches?status=SCHEDULED');
  if (!data || !data.matches) {
    return repondre("❌ Error fetching Ligue 1 matches.");
  }

  const matches = data.matches.slice(0, 5);
  let matchMessage = "⚽ *Upcoming Ligue 1 Matches*\n\n";
  matches.forEach(match => {
    const date = moment(match.utcDate).format("DD/MM HH:mm");
    matchMessage += `• ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}\n  📅 ${date}\n\n`;
  });

  repondre(matchMessage);
});

/** ✅ Premier League Standings */
adams({
  nomCom: "pl",
  categorie: "Football",
  reaction: "🏴"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  const data = await fetchFootballData('competitions/PL/standings');
  if (!data || !data.standings) {
    return repondre("❌ Error fetching Premier League standings.");
  }

  const standings = data.standings[0].table;
  let standingsMessage = "📊 *Premier League Table*\n\n";
  standings.slice(0, 10).forEach((team, index) => {
    standingsMessage += `${index + 1}. ${team.team.name} - ${team.points}P (${team.playedGames}G)\n`;
  });

  repondre(standingsMessage);
});

/** ✅ Premier League Matches */
adams({
  nomCom: "plm",
  categorie: "Football",
  reaction: "📅"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  const data = await fetchFootballData('competitions/PL/matches?status=SCHEDULED');
  if (!data || !data.matches) {
    return repondre("❌ Error fetching Premier League matches.");
  }

  const matches = data.matches.slice(0, 5);
  let matchMessage = "⚽ *Upcoming Premier League Matches*\n\n";
  matches.forEach(match => {
    const date = moment(match.utcDate).format("DD/MM HH:mm");
    matchMessage += `• ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}\n  📅 ${date}\n\n`;
  });

  repondre(matchMessage);
});

/** ✅ La Liga Standings */
adams({
  nomCom: "ll",
  categorie: "Football",
  reaction: "🇪🇸"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  const data = await fetchFootballData('competitions/PD/standings');
  if (!data || !data.standings) {
    return repondre("❌ Error fetching La Liga standings.");
  }

  const standings = data.standings[0].table;
  let standingsMessage = "📊 *La Liga Table*\n\n";
  standings.slice(0, 10).forEach((team, index) => {
    standingsMessage += `${index + 1}. ${team.team.name} - ${team.points}P (${team.playedGames}G)\n`;
  });

  repondre(standingsMessage);
});

/** ✅ Live Scores */
adams({
  nomCom: "live",
  categorie: "Football",
  reaction: "🔥"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  const data = await fetchFootballData('matches?status=LIVE');
  if (!data || !data.matches || data.matches.length === 0) {
    return repondre("❌ No live matches currently.");
  }

  let liveMessage = "⚽ *Live Matches*\n\n";
  data.matches.slice(0, 5).forEach(match => {
    liveMessage += `• ${match.homeTeam.shortName} ${match.score.fullTime.home} - ${match.score.fullTime.away} ${match.awayTeam.shortName}\n  ⏱️ ${match.minute}'\n\n`;
  });

  repondre(liveMessage);
});

/** ✅ Top Scorers */
adams({
  nomCom: "top",
  categorie: "Football",
  reaction: "👑"
}, async (dest, zk, commandOptions) => {
  const { repondre, arg } = commandOptions;
  
  // Default to Premier League if no argument
  const leagueCode = arg[0]?.toUpperCase() || 'PL';
  const validLeagues = ['PL', 'FL1', 'PD', 'BL1', 'SA', 'DED'];
  
  if (!validLeagues.includes(leagueCode)) {
    return repondre(`❌ Invalid league code. Use: ${validLeagues.join(', ')}`);
  }

  const data = await fetchFootballData(`competitions/${leagueCode}/scorers`);
  if (!data || !data.scorers) {
    return repondre("❌ Error fetching top scorers.");
  }

  let scorersMessage = `👑 *Top Scorers (${leagueCode})*\n\n`;
  data.scorers.slice(0, 10).forEach((player, index) => {
    scorersMessage += `${index + 1}. ${player.player.name} - ${player.goals} goals (${player.team.name})\n`;
  });

  repondre(scorersMessage);
});
