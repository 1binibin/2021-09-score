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
*/

/*************** global init *****************/
var auth = firebase.auth();
var googleAuth = new firebase.auth.GoogleAuthProvider();
var firebaseDatabase = firebase.database();
var firebaseStorage = firebase.storage();
var db = firebaseDatabase.ref('root/board');
var storage = firebaseStorage.ref('root/board');
var user = null;


/*************** element init *****************/
var btSave = document.querySelector('.write-wrapper .bt-save');      // 글작성
var btLogin = document.querySelector('.header-wrapper .bt-login');   // 로긴버튼
var btLogout = document.querySelector('.header-wrapper .bt-logout'); // 로그아웃 버튼
var btWrite = document.querySelector('.list-wrapper .bt-write');     // 글쓰기 버튼
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

function onWriteSubmit(e) { //btSave 클릭시 (글저장시) // validation 검증
    e.preventDefault();
    var title = writeForm.title.value.trim();
    var writer = writeForm.write.value.trim();
    var upfile = writeForm.upfile.files;
    var content = writeForm.content.value.trim();
    if(title === '') {

    }
    if(writer === '') {

    }
}

function onRequiredValid(e) {  // title, writer에서 blur되거나 keyup되면
    var el = e.target;
    var next = $(e.target).next()[0];    // js: e.target.nextSibling 공백 까지 찾는다..
    if(el.value.trim() === '') {
        el.classList.add('active');
        next.style.display = 'block';
        return false;
    }
    else {
        el.classList.remove('active');
        next.style.display = 'none';
        return true;
    }
}


function onUpfileBlur(e) {

}

/*************** event init *****************/
auth.onAuthStateChanged(onAuthChanged);
btLogin.addEventListener('click', onLogin);
btLogout.addEventListener('click', onLogout);
btWrite.addEventListener('click', onWrite);
writeForm.addEventListener('submit', onWriteSubmit);
writeForm.title.addEventListener('blur', onRequiredValid);
writeForm.title.addEventListener('keyup', onRequiredValid);
writeForm.writer.addEventListener('keyup', onRequiredValid);
writeForm.writer.addEventListener('blur', onRequiredValid);
writeForm.upfile.addEventListener('blur', onUpfileBlur);


/*************** start init *****************/

