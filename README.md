# wavewar
> HTML5기반 2D 게임 프레임워크인 Phaser3를 활용해 만든 멀티플레이 우주비행선 게임
<img height=400 src="https://user-images.githubusercontent.com/96511687/204724614-9edec128-42f9-42ed-8e7a-8b3f2c006b69.gif">

## packages
```
node 16.14
npm 8.3.1
phaser 3.55.2
express 4.17.3
socket.io 4.4.1
winston 3.6.0
canvas 2.9.1
jsdom 19.0.0
datauri 4.1.0
```
## 시스템 구조도
<img height=400 src="https://user-images.githubusercontent.com/96511687/204726632-75268af6-dc8a-4245-a016-8b1b5b3a7dac.png">

* Server Js
```
server.js
└─ bullet.js
```

* Client Js
```
config.js ─ playGame.js 
            ├─ gameStart.js
            ├─ leaderBoard.js
            ├─ miniMap.js
            ├─ status.js
            ├─ levelUp.js
            └─ gameOver.js
```
## 보완사항
```
1. 비행선이 움직일때 가속도가 증가되는데 이때 화면 버벅임이 발생
  => UDP 통신이 아닌 TCP 통신을 사용해 패킷이 순차적으로 도착하지 않아 발생하는 것으로 예상
2. 플레이어의 수가 많아지는 경우 화면 버벅임 발생
  => 물리연산을 서버에서 모두 처리하는 구조로 연산 처리량이 많아져 발생하는 것으로 예상
```
