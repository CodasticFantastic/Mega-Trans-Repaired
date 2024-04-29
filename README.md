# System Spedycyjny dla firmy Mega-Trans
<strong>Twórca Aplikacji:</strong> Jakub Wojtysiak <br/>
<strong>Licencja:</strong> Aplikacja oraz jej poszczególne elementy nie mogą być wykorzystywane, kopiowane ani powielane bez pisemnej zgody twórcy aplikacji.<br/>
<strong>Framework:</strong> NextJS 14<br/>

---

## Instalacja Aplikacji
Aplikacja wymaga bazy MySql do poprawnego funkcjonowania

1. Stwórz plik .env

<code>NEXT_PUBLIC_DOMAIN="https://domena.com"
DATABASE_URL="mysql://USER:PASSWORD@DB-URL:3306/DB-NAME" (Dane dostępowe do bazy MySql)
NEXTAUTH_SECRET="LONG RANDOM STRING"
NEXTAUTH_URL="https://domena.com"
JWT_SECRET="LONG RANDOM STRING"
JWT_EXPIRE="1d"
NODE_ENV="production"
FORWARD_EMAIL="FORWARD EMAIL ACCOUNT LOGIN"
FORWARD_PASS="FORWARD EMAIL ACCOUNT PASSWORD"
SMS_API_KEY="SMS API KEY"
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
