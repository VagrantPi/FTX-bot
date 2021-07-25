# FTX-bot

## descript

放貸每小時更新貸出數量（上個小時的利息補上

以形成複利

## Setup

### Step 1. 安裝好 postgres DB

### Step 2. 取得 FTX API key

[https://ftx.com/profile](https://ftx.com/profile)

### Step 3. 設定 API key & bot config

```bash
cp default.config.toml config.toml
vim config.toml
```

### Step 4. Line Notify

登入服務

https://notify-bot.line.me/my/services/

發行存取權杖

https://notify-bot.line.me/my/

更新設定檔

```bash
vim config.toml
```

### Step 5. 啟動

```bash
npm start

// start by pm2
npm i pm2 -g
pm2 start app.js -n FTX-bot
```

## docker

也可以使用 docker 來執行

### Step 1. 設定 DB 設定值

```bash
cp docker/.default.env docker/.env
vim docker/.env
```

### Step 2. 設定 API key & bot config

```bash
cp default.config.toml config.toml
vim config.toml
```

### Step 3. Build docker image

```bash
cd docker
docker-compose build
```

### Step 4. 啟動

```bash
docker-compose up -d
```