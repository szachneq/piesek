var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('brick', 'assets/brick.png');
  game.load.image('grass', 'assets/grass.png');
  game.load.image('ground', 'assets/ground.png');
  game.load.image('bone', 'assets/bone.png');
  game.load.spritesheet('dog', 'assets/baddie.png', 32, 32);

  game.load.text('level1', 'levels/level1.json');
  game.load.text('level2', 'levels/level2.json');
  game.load.text('level3', 'levels/level3.json');
}

var move = {
  left: false,
  right: false,
};

var levelData;
var currentLevel = 1;
var cursors;
var player;
var platforms;

var stars;
var score = 0;
var scoreText;
var levelText;
var winText;

function loadLevel(number) {
  levelData = JSON.parse(game.cache.getText('level'+number));

  levelData.bricks.forEach(function (brick) {
    var block = platforms.create(brick.x, brick.y, 'brick');
    block.scale.setTo(0.1, 0.1);
    block.body.immovable = true;
  });

  player.x = 50;
  player.y = 50;
}

function basicWorld() {
  var sky = game.add.sprite(0, 0, 'sky');
  sky.fixedToCamera = true;

  platforms = game.add.group();
  platforms.enableBody = true;

  for (var i = 0; i < 40; i++) {
    var grass = platforms.create(i*40, game.world.height - 40, 'grass');
    grass.scale.setTo(0.1, 0.1);
    grass.body.immovable = true;
  }

  player = game.add.sprite(50, game.world.height - 150, 'dog');
  game.camera.follow(player);

  game.physics.arcade.enable(player);

  player.scale.setTo(1.2,1.2);
  player.body.gravity.y = 500;
  player.body.collideWorldBounds = true;

  player.animations.add('left', [0, 1], 10, true);
  player.animations.add('right', [2, 3], 10, true);

  bones = game.add.group();
  bones.enableBody = true;
  for (var i = 0; i < 12; i++) {
    var bone = bones.create(i * 140, 0, 'bone');
    bone.scale.setTo(0.015, 0.015);
    bone.body.gravity.y = 500;
    bone.body.bounce.y = 0.2;
  }

  scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  scoreText.fixedToCamera = true;

  levelText = game.add.text(200, 16, 'level: '+currentLevel, {fontSize: '32px', fill: '#000'});
  levelText.fixedToCamera = true;
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 1600, 600);

  basicWorld();
  loadLevel(currentLevel);
  cursors = game.input.keyboard.createCursorKeys();
}

function update() {

  //  Collide the player and the stars with the platforms
  game.physics.arcade.collide(player, platforms);
  game.physics.arcade.collide(bones, platforms);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  game.physics.arcade.overlap(player, bones, collectBone, null, this);

  //  Reset the players velocity (movement)
  player.body.velocity.x = 0;

  if (cursors.left.isDown)
  {
    //  Move to the left
    player.body.velocity.x = -150;
    move.left = true;
    move.right = false;
    player.animations.play('left');
  }
  else if (cursors.right.isDown)
  {
    //  Move to the right
    player.body.velocity.x = 150;
    move.left = false;
    move.right = true;
    player.animations.play('right');
  }
  else
  {
    //  Stand still
    player.animations.stop();
    if (move.left) {
        player.frame = 1;
    }
    if (move.right) {
        player.frame = 2;
    }
  }

  //  Allow the player to jump if they are touching the ground.
  if (cursors.up.isDown && player.body.touching.down)
  {
    player.body.velocity.y = -500;
  }

}

function collectBone (player, bone) {
  // Removes from the screen
  bone.kill();

  //  Add and update the score
  score += 10;
  scoreText.text = 'score: ' + score;
  levelText.text = 'level: ' + currentLevel;
  if (score >= 120 && currentLevel < 3) {
    game.world.removeAll();
    currentLevel+=1;
    score = 0;
    basicWorld();

    loadLevel(currentLevel);
  }

  if (score >= 120 && currentLevel >= 3) {
    winText = game.add.text(350, 300, 'You Won!', {fontSize: '300px', fill: '#000'});
    winText.fixedToCamera = true;
  }
}