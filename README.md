# System Spedycyjny dla firmy Mega-Trans
<strong>Twórca Aplikacji:</strong> Jakub Wojtysiak <br/>
<strong>Licencja:</strong> Aplikacja oraz jej poszczególne elementy nie mogą być wykorzystywane, kopiowane ani powielane bez pisemnej zgody twórcy aplikacji.<br/>
<strong>Framework:</strong> NextJS 14<br/>

---

## Instalacja Aplikacji
Aplikacja wymaga bazy MySql do poprawnego funkcjonowania

1. Stwórz plik .env

<code>
NEXT_PUBLIC_DOMAIN="https://domena.com"
DATABASE_URL="mysql://<user>:<password>@<db-url>:3306/<db-name>" (Dane dostępowe do bazy MySql)
NEXTAUTH_SECRET="<long-random-char>"
NEXTAUTH_URL="https://domena.com"
JWT_SECRET="<long-random-char>"
JWT_EXPIRE="1d"
NODE_ENV="production"
FORWARD_EMAIL="<forward-email-account-login>"
FORWARD_PASS="<forward-email-account-password>"
SMS_API_KEY="<sms-api-key>"
</code>

2. Zedytuj plik Dockerfile odpowiednio do swoich potrzeb
3. Uruchom kontener za pomocą komendy

---

## Jak dokonać migracji aplikacji?

1. Dokonaj zrzutu bazy danych MySql
2. Uruchom Bazę MySql na nowym serwerze
3. Dokonaj importu bazy danych MySql
4. Pobierz repozytorium na nowy serwer 
5. Ustaw zmienne środowiskowe (<strong>Instalacja Aplikacji</strong>)
6. Uruchom Kontener
