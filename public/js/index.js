/* 
$().next()      // 내 바로 다음     - JS: nextSibling
$().prev()      // 내 바로 전       - JS: previousSibling
$().parent()    // 내 부모          - JS: parentNode
$().parents()   // 내 조상들        - JS: parentNode
$().siblings()  // 내 형제자매       
$().children()  // 내 자식          - JS: childNodes
$().find()      // 내 자손          - JS: childNodes
keyup:  키를 누루고 뗄때
keydown: 키를 누를때
keypress: 눌렀을때

jQuery data 처리
1. 실시간
db.on('child_added', onAdded);      //return 추가된 데이터
db.on('child_changed', onChanged);  //return 수정된 데이터
db.on('child_removed', onRemoved);  //return 삭제된 데이터

2.이벤트에 의해서
db.push().key       // 데이터 저장
db.set({})          // 데이터 수정
db.remove()         // 데이터 삭제
db.get()            // 데이터 가져오기


*/

/*************** global init *****************/
var auth = firebase.auth();
var googleAuth = new firebase.auth.GoogleAuthProvider();
var firebaseDatabase = firebase.database();
var firebaseStorage = firebase.storage();
var db = firebaseDatabase.ref('root/board');
var storage = firebaseStorage.ref('root/board');
var user = null;
var allowExt = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']


/*************** element init *****************/
var btSave = document.querySelector('.write-wrapper .bt-save');      // 글작성
var btLogin = document.querySelector('.header-wrapper .bt-login');   // 로긴버튼
var btLogout = document.querySelector('.header-wrapper .bt-logout'); // 로그아웃 버튼
var btWrite = document.querySelector('.list-wrapper .bt-write');     // 글작성 모달창 오픈버튼
var btClose = document.querySelector('.write-wrapper .bt-close');     // 글작성 모달창 클로즈버튼
var btReset = document.querySelector('.write-wrapper .bt-reset');     // 글작성 모달창 리셋버튼
var writeWrapper = document.querySelector('.write-wrapper');         // 글작성 모달창
var writeForm = document.writeForm;                                  // 글작성 form , 'form'만 name명 으로 접근가능

/*************** user function  *****************/


/*************** event callback *****************/
// onAuthStateChanged 
function onAuthChanged(r) { // login, logout 상태가 변하면..
    user = r;
    if(user) {  // 로그인 되면 UI가 할일
        btLogin.style.display = 'none';
        btLogout.style.display = 'block';
    }
    else {  // 로그아웃 되면 UI가 할일
        btLogin.style.display = 'block';
        btLogout.style.display = 'none';
    }
}

function onLogin() {    // btLogin이 클릭되면
    auth.signInWithPopup(googleAuth);
}

function onLogout() {   //btLogout이 클릭되면
    auth.signOut();
}

function onWrite() {    // 모달창이 오픈 되면.
    $(writeWrapper).stop().fadeIn(300);
    writeForm.title.focus();
}

function onClose() {    // 모달창이 닫히면
    $(writeWrapper).stop().fadeOut(300);
    onWriteReset();
    
}

function onWriteReset(e) {  // form을 원상태로 돌리기
    writeForm.title.value = '';
    writeForm.title.classList.remove('active');
    writeForm.writer.value = '';
    writeForm.writer.classList.remove('active');
    writeForm.content.value = '';
    document.querySelectorAll('.required-comment').forEach(function(v, i) {
        v.classList.remove('active');
    });
}

function onWriteSubmit(e) { //btSave 클릭시 (글저장시) // validation 검증
	e.preventDefault();
	var title = writeForm.title;
	var writer = writeForm.writer;
	var upfile = writeForm.upfile;
	var content = writeForm.content;
	if(!user()) {
        alert('로그인 후 이용하세요.')
        return false;
	}
	if(!requiredValid(writer)) {
		writer.focus();
		return false;
	}
	if(!upfileValid(upfile)) {
		return false;
	}
	// firebase save
    var data = {};
    data.user = user.uid;
    data.title = title.value;
    data.writer = writer.value;
    data.content = content.value;
    data.createAt = new Date().getTime();
    if(upfile.files.length) {       // 파일이 존재하면 처리 로직
        var file =upfile.files[0];
        var savename = genFile();
        var uploader = storage.child(savename.folder).child(savename.file).put(file);
        uploader.on('state_changed', onUploading, onUploadError, onUploaded)
    }
    else {
        db.push(data).key; // firebase저장
    
    }
    function onUploading(snapshot) { // 파일이 업로드 되는 동안
        console.log('uploading', snapshot.bytesTransferred);    // 파일크기 변하는거
        console.log('uploading', snapshot.totalBytes);  // 파일 크기
        console.log('========================');
        upfile = snapshot;
    }
    
    function onUploaded() {     //파일업로드 완료 후
        upfile.ref.getDownloadURL().then(onSuccess).catch(onError); //getDownloadURL 다운로드 주소
    }
    
    function onUploadError(err) {   // 파일 업로드 실패
        console.log('error', err);
        if(err.code === 'storage/unauthorized') location.href = '../403.html'
        else console.log('error',err);
        //location.href = '../403.html';  // 서버에 한번더 요청 403으로 넘어감
    }
}




function onRequiredValid(e) {  // title, writer에서 blur되거나 keyup되면
    //var el = this; //e.target;
    requiredValid(this)
}

function requiredValid(el) {    // 입력하지 않으면 하단에 required-comment 나타남
    var next = $(el).next()[0];    // js: e.target.nextSibling 공백 까지 찾는다..
    if(el.value.trim() === '') {
        el.classList.add('active');
        next.classList.add('active');
        return false;
    }
    else {
        el.classList.remove('active');
        next.classList.remove('active');
        return true;
    }
    
}


function onUpfileChange(e) {    // upfile에서 change 되면
    upfileValid(this)
}

function upfileValid(el) {
	var next = $(el).next()[0];
	if(el.files.length > 0 && allowType.indexOf(el.files[0].type) === -1) {
		el.classList.add('active');
		next.classList.add('active');
		return false; 
	}
	else {
		el.classList.remove('active');
		next.classList.remove('active');
		return true;
	}
}



/*************** event init *****************/
auth.onAuthStateChanged(onAuthChanged);
btLogin.addEventListener('click', onLogin);
btLogout.addEventListener('click', onLogout);
btWrite.addEventListener('click', onWrite);
btClose.addEventListener('click', onClose);
btReset.addEventListener('click', onWriteReset);
writeForm.addEventListener('submit', onWriteSubmit);
writeForm.title.addEventListener('blur', onRequiredValid);
writeForm.title.addEventListener('keyup', onRequiredValid);
writeForm.writer.addEventListener('keyup', onRequiredValid);
writeForm.writer.addEventListener('blur', onRequiredValid);
writeForm.upfile.addEventListener('change', onUpfileChange);

db.on('child_added', onAdded);
db.on('child_changed', onChanged);
db.on('child_removed', onRemoved);

/*************** start init *****************/

