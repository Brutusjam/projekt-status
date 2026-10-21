#!/bin/sh
# Notfall-Zugang für die Live-Umgebung auf fly.io.
#
#   sh scripts/reset-password.sh                 Benutzer auflisten
#   sh scripts/reset-password.sh <e-mail>        temporäres Passwort setzen
#
# Das Konto wird dabei aktiviert und muss das Passwort beim nächsten
# Login wechseln. Die Sperre nach Fehlversuchen liegt nur im Speicher
# und fällt beim nächsten Neustart weg (fly machine restart).
set -e

APP="${FLY_APP:-projektcockpit-altdorf}"
DB="/data/projektcockpit.db"
EMAIL=$(printf '%s' "$1" | tr 'A-Z' 'a-z' | tr -d ' ')

if [ -z "$EMAIL" ]; then
  CODE='
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(process.env.DB, { readOnly: true });
console.table(db.prepare("SELECT id, email, rolle, aktiv, mustChangePassword FROM Benutzer").all());
'
  PASSWORT=""
else
  PASSWORT=$(LC_ALL=C tr -dc 'A-HJ-NP-Za-km-z2-9' </dev/urandom | head -c 14)
  CODE='
const { DatabaseSync } = require("node:sqlite");
const bcrypt = require("/app/node_modules/bcryptjs");
const db = new DatabaseSync(process.env.DB);
const hash = bcrypt.hashSync(process.env.PW, 12);
const result = db
  .prepare("UPDATE Benutzer SET passwortHash = ?, aktiv = 1, mustChangePassword = 1 WHERE email = ?")
  .run(hash, process.env.EMAIL);
if (result.changes !== 1) {
  console.error("Kein Benutzer mit dieser E-Mail gefunden.");
  process.exit(1);
}
console.log("Passwort gesetzt.");
'
fi

B64=$(printf '%s' "$CODE" | base64 | tr -d '\n')
flyctl ssh console -a "$APP" -C "gosu nextjs sh -c 'DB=$DB EMAIL=$EMAIL PW=$PASSWORT node --no-warnings -e \"\$(echo $B64 | base64 -d)\"'"

if [ -n "$PASSWORT" ]; then
  echo
  echo "Temporäres Passwort für $EMAIL: $PASSWORT"
  echo "Beim Login wirst du aufgefordert, es sofort zu ändern."
fi
