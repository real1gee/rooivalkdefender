//GLOBAL VARIABLES
var title = "jpAdventure";
var myAnimation;
var fps = 30;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
var leftPressed = false;
var upPressed = false;
var rightPressed = false;
var downPressed = false;
var bombPressed = false;
var gameWidth = 780;
var gameHeight = gameWidth / (window.innerWidth/window.innerHeight);
var gWidthRatio = innerWidth / gameWidth;
var gHeightRatio = innerHeight / gameHeight;
var c = document.getElementById("gameCanvas");
c.width = gameWidth;
c.height = gameHeight;
c.style.width = "100%";
c.style.height = "100%";
var ctx = c.getContext("2d");
ctx.font = "bold 18px Arial";
ctx.textAlign = "center";
ctx.textBaseline="middle";

var gameScreen;

//HOWLER JS init
var bgmusic = new Howl({
  src: ['vortex.mp3']
});
var fireSound = new Howl({
  src: ['fire.mp3']
});
fireSound.volume(.3);
var clickSound = new Howl({
  src: ['click.mp3']
});
var explosionSound = new Howl({
  src: ['explosion.mp3']
});
var collectSound = new Howl({
  src: ['collect.mp3']
});
var enemyhitSound = new Howl({
  src: ['enemyhit.mp3']
});

//collision detection
function checkCollision(x, y, clickable){
	if(x > clickable.cor1 && y > clickable.cor2 && x < clickable.cor3 && y < clickable.cor4){
		return true;
	}
	return false;
}

//simple collision with player
function checkCollisionWp(x, y, clickable){
	if(x > clickable.cor1 && y > clickable.cor2+20 && x < clickable.cor3 && y < clickable.cor4){
		return true;
	}
	return false;
}

//check bullet collision
function checkBulletHit(bullet, bulletIndex){
		if(enemies.items.length > 0){			
			for(var enm = 0; enm < enemies.items.length; enm++){
				if(bullet[bulletIndex].posX > enemies.items[enm].posX - enemies.items[enm].colRadius && bullet[bulletIndex].posY > enemies.items[enm].posY - enemies.items[enm].colRadius && bullet[bulletIndex].posX < enemies.items[enm].posX + enemies.items[enm].colRadius && bullet[bulletIndex].posY < enemies.items[enm].posY + enemies.items[enm].colRadius){
					explosion.draw("still", bullet[bulletIndex].posX, bullet[bulletIndex].posY, 1, 0, 0, 0);
					enemies.items[enm].health -= 1;
					if(enemies.items[enm].health <= 0){
						explosion.draw("still", enemies.items[enm].posX, enemies.items[enm].posY, 4, 0, 0, 0);
						explosion.draw("still", enemies.items[enm].posX, enemies.items[enm].posY, 3, 0, 0, 0);
						explosion.draw("still", enemies.items[enm].posX, enemies.items[enm].posY, 2, 0, 0, 0);
						score += 13;
						levelScore += 13;
						localStorage.setItem(title+"Score", score);
						enemies.items.splice(enm, 1);
						enm -= 1;
						explosionSound.play();
					}
					return true;
				}
			}
		}
	return false;
};

var GameImage = function(imagefile, divider){
	this.image = new Image();
	this.image.src = imagefile;
	this.cor1;
	this.cor2;
	this.cor3;
	this.cor4;
	this.currentAnimFrame = 0;
	this.frameCounter = 0;
	this.repCounter = 0;
	
	this.draw = function(stillOrAnim, x, y, startFrame, endFrame, spriteFps, rep){
		var imageWidth, imageHeight, anchX, anchY, frameCounts;
		imageWidth = this.image.width/divider;
		imageHeight = this.image.height;
		anchX = imageWidth/2;
		anchY = imageHeight/2;

		if(stillOrAnim == "still") ctx.drawImage(this.image, startFrame * imageWidth - imageWidth, 0, imageWidth, imageHeight, x-anchX, y-anchY, imageWidth, imageHeight);
		else if(stillOrAnim == "anim"){
			if(rep == 0){
				if(this.currentAnimFrame < startFrame) this.currentAnimFrame = startFrame;
				if(this.currentAnimFrame > endFrame) this.currentAnimFrame = startFrame;
				ctx.drawImage(this.image, imageWidth * this.currentAnimFrame - imageWidth, 0, imageWidth, imageHeight, x-anchX, y-anchY, imageWidth, imageHeight);
				this.frameCounter += spriteFps/fps;
				if(this.frameCounter > 1){
					this.frameCounter = 0;
					this.currentAnimFrame += 1;
				}
			}else if(rep > 0){
				if(this.repCounter < rep){
					if(this.currentAnimFrame < startFrame) this.currentAnimFrame = startFrame;
					if(this.currentAnimFrame > endFrame) this.currentAnimFrame = startFrame;
					ctx.drawImage(this.image, imageWidth * this.currentAnimFrame - imageWidth, 0, imageWidth, imageHeight, x-anchX, y-anchY, imageWidth, imageHeight);
					this.frameCounter += spriteFps/fps;
					if(this.frameCounter > 1){
						this.frameCounter = 0;
						this.currentAnimFrame += 1;
					}
					if(this.currentAnimFrame >= endFrame - startFrame + 1) this.repCounter++;
					if(this.repCounter >= rep) return true;
				}
			}
		}
		
		this.cor1 = x-anchX;
		this.cor2 = y-anchY;
		this.cor3 = x+anchX;
		this.cor4 = y+anchY;
	}
	
	this.reset = function(){
		this.cor1 = -100;
		this.cor2 = -100;
		this.cor3 = -100;
		this.cor4 = -100;
	}
}

var rooiHelImage;
var groundImage;
var ifImage = new GameImage("if.png", 1);
var skybg = new GameImage("skybg.jpg", 1);
var cloud1Image = new GameImage("cloud1.png", 1);
var cloud2Image = new GameImage("cloud2.png", 1);
var bulletMg = new GameImage("bulletMg.png", 1);
var collectiblesImage = new GameImage("collectibles.png", 5);
var enemiesSmall = new GameImage("enemiesSmall.png", 3);
var explosion = new GameImage("explosion.png", 5);
var heliSelection = new GameImage("heliSelection.png", 4);

var btnSelectLevel = new GameImage("btnSelectLevel.png", 1);
var btnSelectAirCraft = new GameImage("btnSelectAirCraft.png", 1);
var btnBack = new GameImage("btnBack.png", 1);
var btnStartLastLevel = new GameImage("btnStartLastLevel.png", 1);
var btnRetry = new GameImage("btnRetry.png", 1);
var btnPrev = new GameImage("btnPrev.png", 1);
var btnNext = new GameImage("btnNext.png", 1);
var btnPlay = new GameImage("btnPlay.png", 1);
var btnPause = new GameImage("btnPause.png", 1);
var btnPurchase = new GameImage("btnPurchase.png", 1);
var btnSelect = new GameImage("btnSelect.png", 1);
var btnMainMenu = new GameImage("btnMainMenu.png", 1);
var btnAbout = new GameImage("btnAbout.png", 1);

var enemBullet = new GameImage("enemBullet.png", 1);

var rooiHeli;
var currentHeli;
if(localStorage.getItem(title+"currentHeli") === null){
	localStorage.setItem(title+"currentHeli", 0);
}
currentHeli = parseInt(localStorage.getItem(title+"currentHeli"));
var aircrafts;
if(localStorage.getItem(title+"OwnedAircraft") === null){
	aircrafts = [];
	aircrafts.push({"price" : 1200, "owned" : true}); 
	aircrafts.push({"price" : 3000, "owned" : false});
	aircrafts.push({"price" : 4800, "owned" : false});
	aircrafts.push({"price" : 11000, "owned" : false});
	localStorage.setItem(title+"OwnedAircraft", JSON.stringify(aircrafts));
}
aircrafts = JSON.parse(localStorage.getItem(title+"OwnedAircraft"));
var heliSelect = currentHeli;
var levelScore;
var score;
if(localStorage.getItem(title+"Score") === null){
	localStorage.setItem(title+"Score", "0");
}
score = parseInt(localStorage.getItem(title+"Score"));
var maxLevel = 10;
var gameLevel;
if(localStorage.getItem(title+"Level") === null){
	localStorage.setItem(title+"Level", "0");
}
gameLevel = parseInt(localStorage.getItem(title+"Level"));
var playLevel = gameLevel;

var enemies;
var collectibles;
var enemBullets;
var enemyProfile;

var targetScore;

function reset(){
	//LEVELVARIABLES//
	rooiHeli = {
		"posX" : gameWidth/2,
		"posY" : gameHeight - 200,
		"type" : 0,
		"health" : 10,
		"maxHealth" : 10,
		"jetSpeed" : 10,
		"firingInterval" : 10,
		"firingTimer" : 0,
		"firingSpeed" : 5,
		"bullets" : [],
		"bulletType" : 0,
		"bulletCounts" : 0
	}
	
	//Heli Specific
	switch (currentHeli){
		case 1 :
			rooiHelImage = new GameImage("rooiHeli1.png", 3);
			rooiHeli.health = 10;
			rooiHeli.maxHealth = 10;
			rooiHeli.jetSpeed = 10;
			rooiHeli.firingSpeed = 7;
			rooiHeli.firingInterval = 8;
			break;
		case 2 :
			rooiHelImage = new GameImage("rooiHeli2.png", 3);
			rooiHeli.health = 10;
			rooiHeli.maxHealth = 10;
			rooiHeli.jetSpeed = 10;
			rooiHeli.firingSpeed = 5;
			rooiHeli.firingInterval = 6;
			break;
		case 3 :
			rooiHelImage = new GameImage("rooiHeli3.png", 3);
			rooiHeli.health = 10;
			rooiHeli.maxHealth = 10;
			rooiHeli.jetSpeed = 10;
			rooiHeli.firingSpeed = 3;
			rooiHeli.firingInterval = 4;
			break;
		default :
			rooiHelImage = new GameImage("rooiHeli.png", 3);
			rooiHeli.health = 10;
			rooiHeli.maxHealth = 10;
			rooiHeli.jetSpeed = 10;
			rooiHeli.firingSpeed = 5;
			rooiHeli.firingInterval = 10;
			break;
	}
	
	//Level Specific
	switch(playLevel){
		case 1 :
			enemies = {"aprInterval" : 150, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 290, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 5, "maxHealth" : 5, "firingInterval" : 300, "firingTimer" : 0};
			groundImage = new GameImage("ground1.jpg", 1);
			targetScore = 140;
			break;
		case 2 :
			enemies = {"aprInterval" : 130, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 280, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 7, "maxHealth" : 7, "firingInterval" : 300, "firingTimer" : 0};
			groundImage = new GameImage("ground2.jpg", 1);
			targetScore = 200;
			break;
		case 3 :
			enemies = {"aprInterval" : 130, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 270, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 9, "maxHealth" : 9, "firingInterval" : 250, "firingTimer" : 0};
			groundImage = new GameImage("ground3.jpg", 1);
			targetScore = 300;
			break;
		case 4 :
			enemies = {"aprInterval" : 130, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 260, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 11, "maxHealth" : 11, "firingInterval" : 250, "firingTimer" : 0};
			groundImage = new GameImage("ground.jpg", 1);
			targetScore = 350;
			break;
		case 5 :
			enemies = {"aprInterval" : 120, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 250, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 13, "maxHealth" : 13, "firingInterval" : 250, "firingTimer" : 0};
			groundImage = new GameImage("ground1.jpg", 1);
			targetScore = 450;
			break;
		case 6 :
			enemies = {"aprInterval" : 120, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 240, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 15, "maxHealth" : 15, "firingInterval" : 250, "firingTimer" : 0};
			groundImage = new GameImage("ground2.jpg", 1);
			targetScore = 600;
			break;
		case 7 :
			enemies = {"aprInterval" : 110, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 230, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 17, "maxHealth" : 17, "firingInterval" : 230, "firingTimer" : 0};
			groundImage = new GameImage("ground3.jpg", 1);
			targetScore = 700;
			break;
		case 8 :
			enemies = {"aprInterval" : 100, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 220, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 19, "maxHealth" : 19, "firingInterval" : 230, "firingTimer" : 0};
			groundImage = new GameImage("ground.jpg", 1);
			targetScore = 750;
			break;
		case 9 :
			enemies = {"aprInterval" : 100, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 210, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 21, "maxHealth" : 21, "firingInterval" : 220, "firingTimer" : 0};
			groundImage = new GameImage("ground1.jpg", 1);
			targetScore = 1000;
			break;
		case 10 :
			enemies = {"aprInterval" : 80, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 200, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 24, "maxHealth" : 24, "firingInterval" : 200, "firingTimer" : 0};
			groundImage = new GameImage("ground2.jpg", 1);
			targetScore = 1200;
			break;
		default : //level 0
			enemies = {"aprInterval" : 150, "aprTimer" : 0, "items" : []};
			collectibles = {"aprInterval" : 300, "aprTimer" : 0, "items" : []};
			enemyProfile = {"type" : 0, "posX" : -100, "posY" : -100, "moveX" : 0, "moveY" : 2, "colRadius" : 50, "health" : 3, "maxHealth" : 3, "firingInterval" : 300, "firingTimer" : 0};
			groundImage = new GameImage("ground.jpg", 1);
			targetScore = 100;
			break;
	}
	enemBullets = [];
	levelScore = 0;
}

//load logo and start the game after it
var zklogo = new GameImage("zk.jpg", 1);
zklogo.image.onload = function(){
	startScene("start");
}

function startScene(x){
	switch (x) {
		case "start" :
			gameScreen = "start";
			bgmusic.stop();
			zklogo.draw("still", gameWidth/2, gameHeight/2, 1, 0, 0, 0);
			var tempInterv = setTimeout(function(){
				clearInterval(tempInterv);
				startScene("mainmenu");
			}, 2000);
			break;
		case "mainmenu" :
			bgmusic.stop();
			bgmusic.play();
			gameScreen = "mainmenu";
			ctx.clearRect(0, 0, gameWidth, gameHeight);
			ctx.fillStyle = "#599ee8";
			ctx.fillRect(0, 0, gameWidth, gameHeight);
			skybg.draw("still", gameWidth/2, gameHeight - (skybg.image.height/2), 1, 0, 0, 0);
			ctx.fillStyle = "black";
			ifImage.draw("still", gameWidth/2, gameHeight/2 - 200, 1, 0, 0, 0);
			btnSelectLevel.draw("still", gameWidth/2, gameHeight/2, 1, 0, 0, 0);
			btnSelectAirCraft.draw("still", gameWidth/2, gameHeight/2 + 70, 1, 0, 0, 0);
			btnStartLastLevel.draw("still", gameWidth/2, gameHeight/2 + 140, 1, 0, 0, 0);
			btnAbout.draw("still", gameWidth/2, gameHeight/2 + 210, 1, 0, 0, 0);
			break;
		case "selectlevel" :
			gameScreen = "selectlevel";
			playLevel = gameLevel;
			levelSelection();
			break;
		case "selectaircraft" :
			gameScreen = "selectaircraft";
			airCraftSelection();
			break;
		case "gameover" :
			gameScreen = "gameover";
			ctx.clearRect(0, 0, gameWidth, gameHeight);
			ctx.fillStyle = "#599ee8";
			ctx.fillRect(0, 0, gameWidth, gameHeight);
			skybg.draw("still", gameWidth/2, gameHeight - (skybg.image.height/2), 1, 0, 0, 0);
			ctx.fillStyle = "black";
			btnRetry.draw("still", gameWidth/2, gameHeight/2, 1, 0, 0, 0);
			btnMainMenu.draw("still", gameWidth/2, gameHeight/2 + 70, 1, 0, 0, 0);
			ctx.font = "bold 35px Arial";
			ctx.textAlign = "center";
			ctx.fillText("Game Over", gameWidth/2, gameHeight/2 - 200);
			ctx.font = "bold 18px Arial";
			break;
		case "missioncomplete" :
			gameScreen = "missioncomplete";
			ctx.clearRect(0, 0, gameWidth, gameHeight);
			ctx.fillStyle = "#599ee8";
			ctx.fillRect(0, 0, gameWidth, gameHeight);
			skybg.draw("still", gameWidth/2, gameHeight - (skybg.image.height/2), 1, 0, 0, 0);
			ctx.fillStyle = "black";
			btnNext.draw("still", gameWidth/2, gameHeight/2, 1, 0, 0, 0);
			btnMainMenu.draw("still", gameWidth/2, gameHeight/2 + 70, 1, 0, 0, 0);
			ctx.textAlign = "center";
			ctx.font = "bold 35px Arial";
			ctx.fillText("Mission: Complete", gameWidth/2, gameHeight/2 - 200);
			ctx.font = "bold 18px Arial";
			break;
		case "theend" :
			gameScreen = "theend";
			ctx.clearRect(0, 0, gameWidth, gameHeight);
			ctx.fillStyle = "#599ee8";
			ctx.fillRect(0, 0, gameWidth, gameHeight);
			skybg.draw("still", gameWidth/2, gameHeight - (skybg.image.height/2), 1, 0, 0, 0);
			ctx.fillStyle = "black";
			btnMainMenu.draw("still", gameWidth/2, gameHeight/2 + 500, 1, 0, 0, 0);
			ctx.font = "bold 35px Arial";
			ctx.textAlign = "center";
			ctx.fillText("THE END", gameWidth/2, gameHeight/2 - 200);
			ctx.font = "bold 18px Arial";
			break;
		case "startlevel" :
			reset();
			gameScreen = "startlevel";
			isPaused = false;
			showLoadingScreen();
			setTimeout(function(){
				loopDGame();
			}, 1000);
			break;
	}
}

function loopDGame() {
	
	myAnimation = requestAnimationFrame(loopDGame);
	
	now = Date.now();
    delta = now - then;
     
    if (delta > interval) {
		then = now - (delta % interval);
		//update codes here
		update();
	}
}

function stop(){
	cancelAnimationFrame(myAnimation);
}

function update(){	
	ctx.clearRect(0, 0, gameWidth, gameHeight);
	ctx.fillStyle = "#cfecff";
	ctx.fillRect(0, 0, gameWidth, gameHeight);
	ctx.fillStyle = "black";
	generateGround();
	generateCloud1();
	generateCloud2();
	generateCollectibles();
	generateEnemBullets();
	generateEnemies();
	fire();
	moverooiHeli();
	updatePlayerStat();
}

function moverooiHeli(){	
	if(!leftPressed && !rightPressed){
		if(planeTouchNav){
			if(touchCord.X < rooiHeli.posX) rooiHelImage.draw("still", rooiHeli.posX, rooiHeli.posY, 2, 0, 0, 0);
			else rooiHelImage.draw("still", rooiHeli.posX, rooiHeli.posY, 3, 0, 0, 0);
		} else rooiHelImage.draw("still", rooiHeli.posX, rooiHeli.posY, 1, 0, 0, 0);
	}else{
		if(leftPressed && !rightPressed){
			rooiHelImage.draw("still", rooiHeli.posX, rooiHeli.posY, 2, 0, 0, 0);
			if(rooiHeli.posX > 0) rooiHeli.posX -= rooiHeli.jetSpeed;
		}
		if(rightPressed && !leftPressed){
			rooiHelImage.draw("still", rooiHeli.posX, rooiHeli.posY, 3, 0, 0, 0);
			if(rooiHeli.posX < gameWidth) rooiHeli.posX += rooiHeli.jetSpeed;
		}
		if(leftPressed && rightPressed) rooiHelImage.draw("still", rooiHeli.posX, rooiHeli.posY, 1, 0, 0, 0);
	}
	if(upPressed && !downPressed) if(rooiHeli.posY > 0) rooiHeli.posY -= rooiHeli.jetSpeed;
	if(!upPressed && downPressed) if(rooiHeli.posY < gameHeight) rooiHeli.posY += rooiHeli.jetSpeed;
	followTouches();
}

var ground = [];
var multiGround = 1568;
function generateGround(){
	if(ground.length == 0){
		ground.push({"posX" : gameWidth/2, "posY" : gameHeight - 1568/2});
		if(multiGround < gameHeight*2){
			while(multiGround < gameHeight*2){
				ground.push({"posX" : gameWidth/2, "posY" : gameHeight - (1568/2) - 1568});
				multiGround += 1568;
			}
		}
	}
	if(ground.length > 0){
		for(var i = 0; i < ground.length; i++){
			ground[i].posY += .5;
			groundImage.draw("still", ground[i].posX, ground[i].posY, 1, 0, 0, 0);
			if(ground[i].posY > gameHeight + 1568/2){
				var lastGroundY = ground[ground.length-1].posY;
				ground.splice(i, 1);
				i -= 1;
				ground.push({"posX" : gameWidth/2, "posY" : lastGroundY - 1568});
			}
		}
	}
}

var cloud1 = [];
var multicloud1 = 1568;
function generateCloud1(){
	if(cloud1.length == 0){
		cloud1.push({"posX" : gameWidth/2, "posY" : gameHeight - 1568/2});
		if(multicloud1 < gameHeight*2){
			while(multicloud1 < gameHeight*2){
				cloud1.push({"posX" : gameWidth/2, "posY" : gameHeight - (1568/2) - 1568});
				multicloud1 += 1568;
			}
		}
	}
	if(cloud1.length > 0){
		for(var i = 0; i < cloud1.length; i++){
			cloud1[i].posY += 1;
			cloud1Image.draw("still", cloud1[i].posX, cloud1[i].posY, 1, 0, 0, 0);
			if(cloud1[i].posY > gameHeight + 1568/2){
				var lastcloud1Y = cloud1[cloud1.length-1].posY;
				cloud1.splice(i, 1);
				i -= 1;
				cloud1.push({"posX" : gameWidth/2, "posY" : lastcloud1Y - 1568});
			}
		}
	}
}

var cloud2 = [];
var multicloud2 = 1568;
function generateCloud2(){
	if(cloud2.length == 0){
		cloud2.push({"posX" : gameWidth/2, "posY" : gameHeight - 1568/2});
		if(multicloud2 < gameHeight*2){
			while(multicloud2 < gameHeight*2){
				cloud2.push({"posX" : gameWidth/2, "posY" : gameHeight - (1568/2) - 1568});
				multicloud2 += 1568;
			}
		}
	}
	if(cloud2.length > 0){
		for(var i = 0; i < cloud2.length; i++){
			cloud2[i].posY += 4;
			cloud2Image.draw("still", cloud2[i].posX, cloud2[i].posY, 1, 0, 0, 0);
			if(cloud2[i].posY > gameHeight + 1568/2){
				var lastcloud2Y = cloud2[cloud2.length-1].posY;
				cloud2.splice(i, 1);
				i -= 1;
				cloud2.push({"posX" : gameWidth/2, "posY" : lastcloud2Y - 1568});
			}
		}
	}
}

var isPaused = false;
function pause(){
	if(gameScreen == "startlevel"){
		if(!isPaused){
			isPaused = true;
			stop();
			ctx.globalAlpha = 0.5;
			ctx.fillRect(0, 0, gameWidth, gameHeight);
			ctx.globalAlpha = 1.0;
			btnPlay.draw("still", gameWidth/2, gameHeight/2, 1, 0, 0, 0);
			btnMainMenu.draw("still", gameWidth/2, gameHeight/2 + 100, 1, 0, 0, 0);
			bgmusic.stop();
		}
	}
}

function resume(){
	if(isPaused){
		isPaused = false;
		myAnimation = requestAnimationFrame(loopDGame);
	}
}

var leftPressed = false;
var upPressed = false;
var rightPressed = false;
var downPressed = false;
var bombPressed = false;

$(document	).keydown(function(e){
	if (e.keyCode == 37) { 
		leftPressed = true;
		return false;
	}
	if (e.keyCode == 38) { 
		upPressed = true;
		return false;
	}
	if (e.keyCode == 39) { 
		rightPressed = true;
		return false;
	}
	if (e.keyCode == 40) { 
		downPressed = true;
		return false;
	}
	if (e.keyCode == 32) { 
		bombPressed = true;
		return false;
	}
});

$(document).keyup(function(e){
	if (e.keyCode == 37) { 
		leftPressed = false;
		return false;
	}
	if (e.keyCode == 38) { 
		upPressed = false;
		return false;
	}
	if (e.keyCode == 39) { 
		rightPressed = false;
		return false;
	}
	if (e.keyCode == 40) { 
		downPressed = false;
		return false;
	}
	if (e.keyCode == 32) { 
		bombPressed = false;
		return false;
	}
});

var planeTouchNav = false;
var touchCord = {"X" : 0, "Y" : 0};
document.getElementById("gameCanvas").addEventListener('touchstart', function(e){
	var userTouches = e.changedTouches[0];	
	touchCord.X = userTouches.clientX/gWidthRatio;
	touchCord.Y = userTouches.clientY/gHeightRatio;
	switch (gameScreen){
		case "mainmenu" :
			if(checkCollision(touchCord.X, touchCord.Y, btnSelectLevel)) {
				clickSound.play();
				startScene("selectlevel");
			}
			if(checkCollision(touchCord.X, touchCord.Y, btnSelectAirCraft)){
				clickSound.play();
				startScene("selectaircraft");
			}
			if(checkCollision(touchCord.X, touchCord.Y, btnStartLastLevel)){
				clickSound.play();
				playLevel = gameLevel;
				startScene("startlevel");
			}
			if(checkCollision(touchCord.X, touchCord.Y, btnAbout)){
				clickSound.play();
				startScene("about");
			}
			break;
		case "selectlevel" :
			if(checkCollision(touchCord.X, touchCord.Y, btnBack)) startScene("mainmenu");
			if(playLevel >= 0 && playLevel <= maxLevel){
				if(checkCollision(touchCord.X, touchCord.Y, btnPrev)){
					clickSound.play();
					if(playLevel > 0) playLevel -= 1;
					levelSelection();
				}
				if(checkCollision(touchCord.X, touchCord.Y, btnNext)){
					clickSound.play();
					if(playLevel < maxLevel) playLevel += 1;
					levelSelection();
				}
				if(checkCollision(touchCord.X, touchCord.Y, btnPlay)){
					clickSound.play();
					if(playLevel <= gameLevel) startScene("startlevel");
				}
			}
			break;
		case "selectaircraft" :
			if(checkCollision(touchCord.X, touchCord.Y, btnBack)) startScene("mainmenu");
			if(heliSelect >= 0 && heliSelect <= aircrafts.length-1){
				if(checkCollision(touchCord.X, touchCord.Y, btnPrev)){
					clickSound.play();
					if(heliSelect > 0) heliSelect -= 1;
					airCraftSelection();
				}
				if(checkCollision(touchCord.X, touchCord.Y, btnNext)){
					clickSound.play();
					if(heliSelect < aircrafts.length-1) heliSelect += 1;
					airCraftSelection();
				}
				if(checkCollision(touchCord.X, touchCord.Y, btnPurchase)){
					clickSound.play();
					if(heliSelect <= aircrafts.length-1 && score > aircrafts[heliSelect].price && !aircrafts[heliSelect].owned){
						aircrafts[heliSelect].owned = true;
						score -= aircrafts[heliSelect].price;
						localStorage.setItem(title+"Score", score);
						localStorage.setItem(title+"OwnedAircraft", JSON.stringify(aircrafts));
						airCraftSelection();
						return;
					}
				}
				if(checkCollision(touchCord.X, touchCord.Y, btnSelect)){
					clickSound.play();
					if(heliSelect <= aircrafts.length-1){
						if(aircrafts[heliSelect].owned){
							currentHeli = heliSelect;
							localStorage.setItem(title+"currentHeli", currentHeli);
							startScene("mainmenu");
						}
					}
				}
				if(checkCollision(touchCord.X, touchCord.Y, btnPlay)){
					clickSound.play();
					if(heliSelect <= aircrafts.length-1){
						if(aircrafts[heliSelect].owned){
							currentHeli = heliSelect;
							localStorage.setItem(title+"currentHeli", currentHeli);
							startScene("startlevel");
						}
					}
				}
			}
			break;
		case "gameover" :
			if(checkCollision(touchCord.X, touchCord.Y, btnRetry)){
				clickSound.play();
				startScene("startlevel");
			}
			if(checkCollision(touchCord.X, touchCord.Y, btnMainMenu)){
				clickSound.play();
				startScene("mainmenu");
			}
			break;
		case "theend" :
			if(checkCollision(touchCord.X, touchCord.Y, btnMainMenu)){
				clickSound.play();
				startScene("mainmenu");
			}
			break;
		case "missioncomplete" :
			if(checkCollision(touchCord.X, touchCord.Y, btnNext)){
				clickSound.play();
				startScene("startlevel");
			}
			if(checkCollision(touchCord.X, touchCord.Y, btnMainMenu)){
				clickSound.play();
				startScene("mainmenu");
			}
			break;
		case "startlevel" :
			if(isPaused){
				if(checkCollision(touchCord.X, touchCord.Y, btnPlay)){
					clickSound.play();
					resume();
				}
				if(checkCollision(touchCord.X, touchCord.Y, btnMainMenu)){
					clickSound.play();
					isPaused = false;
					stop();
					reset();
					startScene("mainmenu");
				}
			}
			if(checkCollision(touchCord.X, touchCord.Y, btnPause)){
				clickSound.play();
				pause();
			}
			break;
		case "about" :
			if(checkCollision(touchCord.X, touchCord.Y, btnMainMenu)){
				clickSound.play();
				startScene("mainmenu");
			}
			break;
	}
	e.preventDefault();
}, false);

document.getElementById("gameCanvas").addEventListener('touchmove', function(e){
	var userTouches = e.changedTouches[0];
	touchCord.X = userTouches.clientX/gWidthRatio;
	touchCord.Y = userTouches.clientY/gHeightRatio;
	switch (gameScreen){
		case "startlevel" :
			planeTouchNav = true;
			break;
	}
	e.preventDefault();
}, false);

function onStart ( touchEvent ) {
	if(navigator.userAgent.match(/Android/i)){
		touchEvent.preventDefault();
	}
}

document.getElementById("gameCanvas").addEventListener('touchend', function(e){
	planeTouchNav = false;
	upPressed = false;
	downPressed = false;
	leftPressed = false;
	rightPressed = false;
	e.preventDefault();
}, false);

function followTouches(){
	if(planeTouchNav){
		if(touchCord.X < rooiHeli.posX - 20){
			leftPressed = true;
			rightPressed = false;
		} else leftPressed = false;
		if(touchCord.X > rooiHeli.posX + 20){
			rightPressed = true;
			leftPressed = false;
		} else rightPressed = false;
		if(touchCord.Y < rooiHeli.posY - 20 + 100){
			upPressed = true;
			downPressed = false;
		} else upPressed = false;
		if(touchCord.Y > rooiHeli.posY + 20 + 100){
			downPressed = true;
			upPressed = false;
		} else downPressed = false;
	}
}

function fire(){
	if(rooiHeli.firingTimer >= rooiHeli.firingInterval){
		fireSound.play();
		var tempXPos = Math.random() * 3;
		switch(rooiHeli.bulletType){
			case 0 :
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX, "posY" : rooiHeli.posY, "moveX" : 0});
				break;
			case 1 :
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX - 25, "posY" : rooiHeli.posY, "moveX" : -1});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX + 25, "posY" : rooiHeli.posY, "moveX" : 1});
				rooiHeli.bulletCounts -= 2;
				break;
			case 2 :
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX - 25, "posY" : rooiHeli.posY - 25, "moveX" : -1});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX + 25, "posY" : rooiHeli.posY - 25, "moveX" : 1});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX - 75, "posY" : rooiHeli.posY, "moveX" : -2});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX + 75, "posY" : rooiHeli.posY, "moveX" : 2});
				rooiHeli.bulletCounts -= 4;
				break;
			case 3 :
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX, "posY" : rooiHeli.posY - 50, "moveX" : 0});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX - 25, "posY" : rooiHeli.posY - 25, "moveX" : -2});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX + 25, "posY" : rooiHeli.posY - 25, "moveX" : 2});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX - 75, "posY" : rooiHeli.posY, "moveX" : -4});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX + 75, "posY" : rooiHeli.posY, "moveX" : 4});
				rooiHeli.bulletCounts -= 5;
				break;
			case 4 :
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX, "posY" : rooiHeli.posY, "moveX" : 0});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX - 25, "posY" : rooiHeli.posY, "moveX" : -1});
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX + 25, "posY" : rooiHeli.posY, "moveX" : 1});
				rooiHeli.bulletCounts -= 3;
				break;
			default :
				rooiHeli.bullets.push({"posX" : tempXPos + rooiHeli.posX, "posY" : rooiHeli.posY, "moveX" : 0});
				break;
		}
		rooiHeli.firingTimer = 0;
		if(rooiHeli.bulletType != 0) if(rooiHeli.bulletCounts <= 0){
			rooiHeli.bulletType = 0;
			rooiHeli.firingInterval = 10;
		}
	}
	rooiHeli.firingTimer++;
	if(rooiHeli.bullets.length > 0){
		for(var i = 0; i < rooiHeli.bullets.length; i++){
			var currentItem = rooiHeli.bullets[i];
			if(currentItem.posY < -100){
				rooiHeli.bullets.splice(i, 1);
				i -= 1;
			}else{
				currentItem.posY -= 14 + rooiHeli.firingSpeed;
				currentItem.posX += currentItem.moveX;
				switch(rooiHeli.bulletType){
					default : 
						bulletMg.draw("still", currentItem.posX, currentItem.posY, 1, 0, 0, 0);
						break;
				}
				if(checkBulletHit(rooiHeli.bullets, i)){
					rooiHeli.bullets.splice(i, 1);
					i -= 1;
				}
			}			
		}
	}
}

function generateCollectibles(){
	if(collectibles.aprTimer >= collectibles.aprInterval){
		var tempXPos = (Math.random() * gameWidth - 100) + 100;
		var tempType = Math.floor(Math.random() * 5) + 1;
		collectibles.items.push({"type" : tempType, "posX" : tempXPos, "posY" : -100});
		collectibles.aprTimer = 0;
	}
	collectibles.aprTimer++;
	if(collectibles.items.length > 0){
		for(var i = 0; i < collectibles.items.length; i++){
			var currentItem = collectibles.items[i];
			if(currentItem.posY > gameHeight + 100){
				collectibles.items.splice(i, 1);
				i -= 1;
			}else{
				currentItem.posY += 2;
				switch (currentItem.type){
					case 1 :
						collectiblesImage.draw("still", currentItem.posX, currentItem.posY, 1, 0, 0, 0);
						break;
					case 2 : 
						collectiblesImage.draw("still", currentItem.posX, currentItem.posY, 2, 0, 0, 0);
						break;
					case 3 : 
						collectiblesImage.draw("still", currentItem.posX, currentItem.posY, 3, 0, 0, 0);
						break;
					case 4 : 
						collectiblesImage.draw("still", currentItem.posX, currentItem.posY, 4, 0, 0, 0);
						break;
					case 5 : 
						collectiblesImage.draw("still", currentItem.posX, currentItem.posY, 5, 0, 0, 0);
						break;
				}
				if(checkCollision(currentItem.posX, currentItem.posY, rooiHelImage)){
					collectSound.play();
					switch (currentItem.type){
						case 1 :
							rooiHeli.health = rooiHeli.maxHealth;
							break;
						case 2 : 
							rooiHeli.firingInterval = 6;
							rooiHeli.bulletType = 1;
							rooiHeli.bulletCounts = 100;
							break;
						case 3 : 
							rooiHeli.firingInterval = 7;
							rooiHeli.bulletType = 2;
							rooiHeli.bulletCounts = 200;
							break;
						case 4 : 
							rooiHeli.firingInterval = 5;
							rooiHeli.bulletType = 3;
							rooiHeli.bulletCounts = 150;
							break;
						case 5 : 
							rooiHeli.firingInterval = 3;
							rooiHeli.bulletType = 4;
							rooiHeli.bulletCounts = 350;
							break;
					}
					collectibles.items.splice(i, 1);
					i -= 1;
				}
			}
		}
	}
}

function generateEnemies(){
	if(enemies.aprTimer >= enemies.aprInterval){
		var tempXPos = (Math.random() * gameWidth - 100) + 100;
		var tempEnmType = Math.floor(Math.random() * 3) + 1;
		enemies.items.push({"type" : tempEnmType, "posX" : tempXPos, "posY" : enemyProfile.posY, "moveX" : enemyProfile.moveX, "moveY" : enemyProfile.moveY, "colRadius" : enemyProfile.colRadius, "health" : enemyProfile.health, "maxHealth" : enemyProfile.maxHealth, "firingInterval" : enemyProfile.firingInterval, "firingTimer" : enemyProfile.firingTimer});
		enemies.aprTimer = 0;
	}
	enemies.aprTimer++;
	if(enemies.items.length > 0){
		for(var i = 0; i < enemies.items.length; i++){
			var currentItem = enemies.items[i];
			if(currentItem.posY > gameHeight + 100){
				enemies.items.splice(i, 1);
				i -= 1;
			}else{
				currentItem.posX += currentItem.moveX;
				currentItem.posY += currentItem.moveY;
				currentItem.firingTimer++;
				if(currentItem.firingTimer >= currentItem.firingInterval){
					currentItem.firingTimer = 0;
					//LEVELVARIABLES//
					//firing profile - level specific
					switch (playLevel){
						case 1 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 4});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 4});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 7});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 4});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 7});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 10});
									break;
							}
							//spreading bullets
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : -1, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 1, "moveY" : 4});
							break;
						case 2 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 5});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 5});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 8});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 5});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 8});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 11});
									break;
							}
							//spreading bullets
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : -1, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 1, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : -2, "moveY" : 5});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 2, "moveY" : 5});
							break;
						case 3 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 6});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 6});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 9});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 6});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 9});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 12});
									break;
							}
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : -1, "moveY" : 6});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 1, "moveY" : 6});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : -2, "moveY" : 8});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 2, "moveY" : 8});
							break;
						case 4 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 7});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 7});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 10});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 7});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 10});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 13});
									break;
							}
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 10, "moveX" : -1, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 10, "moveX" : 1, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 10, "moveX" : -2, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 10, "moveX" : 2, "moveY" : 9});
							break;
						case 5 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 8});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 8});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 11});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 8});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 11});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 14});
									break;
							}
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 10, "moveX" : -1, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 10, "moveX" : 1, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 10, "moveX" : -2, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 10, "moveX" : 2, "moveY" : 9});
							break;
						case 6 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 9});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 9});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 12});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 9});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 12});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 15});
									break;
							}
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : -2, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : 2, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : -4, "moveY" : 9});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : 4, "moveY" : 9});
							break;
						case 7 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 10});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 10});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 13});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 10});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 13});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 16});
									break;
							}
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : -2, "moveY" : 3});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : 2, "moveY" : 3});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : -4, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : 4, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : -2, "moveY" : 5});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : 2, "moveY" : 5});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : -4, "moveY" : 6});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : 4, "moveY" : 6});
							break;
						case 8 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 11});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 11});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 14});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 11});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 14});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 17});
									break;
							}
							break;
						case 9 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 12});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 12});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 15});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 12});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 15});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 18});
									break;
							}
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : -2, "moveY" : 3});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : 2, "moveY" : 3});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : -4, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : 4, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : -2, "moveY" : 5});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : 2, "moveY" : 5});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : -4, "moveY" : 6});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : 4, "moveY" : 6});
							break;
						case 10 :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 13});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 13});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 16});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 13});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 16});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 19});
									break;
							}
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : -2, "moveY" : 3});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : 2, "moveY" : 3});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : -4, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : 4, "moveY" : 4});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : -2, "moveY" : 5});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 20, "moveX" : 2, "moveY" : 5});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : -4, "moveY" : 6});
							enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY - 30, "moveX" : 4, "moveY" : 6});
							break;
						default :
							switch(currentItem.type){
								case 1 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 3});
									break;
								case 2 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 3});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 6});
									break;
								case 3 :
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 3});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 6});
									enemBullets.push({"posX" : currentItem.posX, "posY" : currentItem.posY, "moveX" : 0, "moveY" : 9});
									break;
							}
							break;
					}
				}
				switch(currentItem.type){
					case 1 :
						enemiesSmall.draw("still", currentItem.posX, currentItem.posY, 1, 0, 0, 0);
						break;
					case 2 :
						enemiesSmall.draw("still", currentItem.posX, currentItem.posY, 2, 0, 0, 0);
						break;
					case 3 :
						enemiesSmall.draw("still", currentItem.posX, currentItem.posY, 3, 0, 0, 0);
						break;
				}
				var healthPerc = currentItem.health / currentItem.maxHealth;
				ctx.fillStyle = "#e5e5e5";
				ctx.fillRect(currentItem.posX - 50, currentItem.posY - currentItem.colRadius - 10, 100, 2);
				if(healthPerc*100 > 50) ctx.fillStyle = "#24ff00";
				else ctx.fillStyle = "red";
				healthPerc = 100 * healthPerc;
				ctx.fillRect(currentItem.posX - 50, currentItem.posY - currentItem.colRadius - 10, healthPerc, 2);
				ctx.fillStyle = "black";
				if(checkCollisionWp(currentItem.posX, currentItem.posY, rooiHelImage)){
					explosion.draw("still", currentItem.posX, currentItem.posY, 2, 0, 0, 0);
					enemies.items.splice(i, 1);
					i -= 1;
					rooiHeli.health -= 3;
				}
			}
		}
	}
}

function generateEnemBullets(){
	if(enemBullets.length > 0){
		for(var i = 0; i < enemBullets.length; i++){
			var currentItem = enemBullets[i];
			if(currentItem.posX < -100 || currentItem.posX > gameWidth+100 || currentItem.posY > gameHeight+100){
				enemBullets.splice(i, 1);
				i -= 1;
			}else{
				currentItem.posX += currentItem.moveX;
				currentItem.posY += currentItem.moveY;
				enemBullet.draw("still", currentItem.posX, currentItem.posY, 1, 0, 0, 0);
				if(checkCollisionWp(currentItem.posX, currentItem.posY, rooiHelImage)){
					enemyhitSound.play();
					explosion.draw("still", currentItem.posX, currentItem.posY, 1, 0, 0, 0);
					enemBullets.splice(i, 1);
					i -= 1;
					rooiHeli.health -= 1;
				}
			}
		}
	}
}

function updatePlayerStat(){
	ctx.textAlign = "left";
	if(rooiHeli.bulletType != 0){
		ctx.fillText("Ammo: " + rooiHeli.bulletCounts, 10, gameHeight - 20);
	}else{
		ctx.fillText("Ammo: Unlimited", 10, gameHeight - 20);
	}
	ctx.textAlign = "right";
	if(rooiHeli.health <= 0){
		stop();
		reset();
		startScene("gameover");
		return;
	}else{
		ctx.fillText("Level: " + playLevel, gameWidth - 10, gameHeight - 40);
		ctx.fillText("Health: " + rooiHeli.health*10 + "%", gameWidth - 10, gameHeight - 20);
		ctx.fillStyle = "#e5e5e5";
		ctx.fillRect(0, gameHeight-5, gameWidth, gameHeight);
		var healthPerc = rooiHeli.health / rooiHeli.maxHealth;
		if(healthPerc * 100 < 50){
			ctx.fillStyle = "red";
		}else ctx.fillStyle = "#24ff00";
		healthPerc = gameWidth * healthPerc;
		ctx.fillRect(0, gameHeight-5, healthPerc, gameHeight);
		ctx.fillStyle = "black";
	}
	//total score
	ctx.textAlign = "left";
	ctx.font = "bold 18px Arial";
	ctx.fillText("Total Score:", 20, 20);
	ctx.font = "bold 28px Arial";
	ctx.fillText(score, 20, 50);
	ctx.font = "bold 18px Arial";
	//pause button
	ctx.textAlign = "right";
	btnPause.draw("still", gameWidth - 30, 30, 1, 0, 0, 0);
	//level score
	ctx.textAlign = "center";
	ctx.font = "bold 18px Arial";
	ctx.fillText("Level Score Target:", gameWidth/2, 20);
	ctx.font = "bold 28px Arial";
	ctx.fillText(levelScore + "/" + targetScore, gameWidth/2, 50);
	ctx.font = "bold 18px Arial";
	if(levelScore >= targetScore) missionComplete();	
}

function missionComplete(){
	stop();
	reset();
	if(playLevel == maxLevel){
		startScene("theend");
	}else{
		if(playLevel == gameLevel){
			gameLevel += 1;
			playLevel = gameLevel;
			localStorage.setItem(title+"Level", gameLevel);
		}else if(playLevel < gameLevel){
			playLevel += 1;
		}
		startScene("missioncomplete");
	}
}

function levelSelection(){
	if(playLevel >= 0 && playLevel <= maxLevel){
		ctx.clearRect(0, 0, gameWidth, gameHeight);
		ctx.fillStyle = "#599ee8";
		ctx.fillRect(0, 0, gameWidth, gameHeight);
		skybg.draw("still", gameWidth/2, gameHeight - (skybg.image.height/2), 1, 0, 0, 0);
		ctx.globalAlpha = .25;
		ifImage.draw("still", gameWidth/2, gameHeight/2 - 200, 1, 0, 0, 0);
		ctx.globalAlpha = 1;
		ctx.fillStyle = "black";
		btnBack.draw("still", gameWidth/2, gameHeight - 130, 1, 0, 0, 0);
		ctx.font = "bold 35px Arial";
		ctx.fillText("Select Level: " + playLevel, gameWidth/2, gameHeight/2 - 200);
		ctx.font = "bold 18px Arial";
		if(playLevel > gameLevel) ctx.fillText("LOCKED", gameWidth/2, gameHeight/2 - 150);
		else btnPlay.draw("still", gameWidth/2, gameHeight - 200, 1, 0, 0, 0);
		btnPrev.draw("still", 110, gameHeight - 70, 1, 0, 0, 0);
		btnNext.draw("still", gameWidth-110, gameHeight - 70, 1, 0, 0, 0);
	}
}

function airCraftSelection(){
	if(heliSelect >= 0 && heliSelect <= aircrafts.length-1){		
		ctx.clearRect(0, 0, gameWidth, gameHeight);
		ctx.fillStyle = "#599ee8";
		ctx.fillRect(0, 0, gameWidth, gameHeight);
		skybg.draw("still", gameWidth/2, gameHeight - (skybg.image.height/2), 1, 0, 0, 0);
		ctx.globalAlpha = .25;
		ifImage.draw("still", gameWidth/2, gameHeight/2 - 200, 1, 0, 0, 0);
		ctx.globalAlpha = 1;
		if(!aircrafts[heliSelect].owned)	btnPurchase.draw("still", gameWidth/2, gameHeight - 200, 1, 0, 0, 0);
		else{
			btnPlay.draw("still", gameWidth/2, gameHeight - 200, 1, 0, 0, 0);
			btnSelect.draw("still", gameWidth/2, gameHeight - 270, 1, 0, 0, 0);
		}
		btnBack.draw("still", gameWidth/2, gameHeight - 130, 1, 0, 0, 0);
		ctx.fillStyle = "black";
		btnPrev.draw("still", 110, gameHeight - 70, 1, 0, 0, 0);
		btnNext.draw("still", gameWidth-110, gameHeight - 70, 1, 0, 0, 0);
		ctx.font = "bold 35px Arial";
		ctx.fillText("Select Aircraft", gameWidth/2, gameHeight/2 - 200);
		ctx.font = "bold 18px Arial";
		if(!aircrafts[heliSelect].owned){
			ctx.fillText("Price: " + aircrafts[heliSelect].price, gameWidth/2, gameHeight/2 - 150);
			ctx.fillText("Your Money: " + score, gameWidth/2, gameHeight/2 - 120);
		}
		heliSelection.draw("still", gameWidth/2, gameHeight/2, heliSelect+1, 0, 0, 0);
		
	}
}

function showLoadingScreen(){
	ctx.fillRect(0, 0, gameWidth, gameHeight);
	ctx.fillStyle = "#24ff00";
	ctx.fillText("Loading...", gameWidth/2, gameHeight/2);
	ctx.fillStyle = "black";
}