/*************** global init *****************/
var auth = firebase.auth();
var database = firebase.database();
var storage = firebase.storage();
var googleAuth = new firebase.auth.GoogleAuthProvider();
var dbRoot = database.ref('root');
var stRoot = storage.ref().child('imgs');
var upfile;

//console.log(uuidv4());

/*************** user function  *****************/
function genFile() {
    var folder = moment().format('YYYYMMDDHH');
    return {
        folder: folder,
        file: folder + '_' + uuidv4()
    }
}

/*************** event callback *****************/
function onAuthChanged(r) {
    if(r) {
        $('.bt-login').hide();
        $('.bt-logout').show();
    }
    else {
        $('.bt-login').show();
        $('.bt-logout').hide();
    }
}
function onLogin() {
    auth.signInWithPopup(googleAuth);
}

function onLogout() {  
    auth.signOut();
}

function onSubmit(e) {
    e.preventDefault();
    var el = document.querySelector('input[name="upfile"]');
    if(el.files.length) {
        var file = document.querySelector('input[name="upfile"]').files[0];  //jq: $('input[name="upfile"]')[0].files, input type file
        var savename = genFile();
        var uploader = stRoot.child(savename.folder).child(savename.file).put(file);
        uploader.on('state_changed', onUploading, onUploadError, onUploaded)
    }
}

function onUploading(snapshot) { // snapshot 현재 상태를 뜻함
    console.log('uploading', snapshot.bytesTransferred);    // 파일크기 변하는거
    console.log('uploading', snapshot.totalBytes);  // 파일 크기
    console.log('========================');
    upfile = snapshot;
}

function onUploaded(snapshot) {
    upfile.ref.getDownloadURL().then(onSuccess).catch(onError); //getDownloadURL 다운로드 주소
}

function onUploadError(err) {
    console.log('error', err);
    if(err.code === 'storage/unauthorized') location.href = '../403.html'
    else console.log('error',err);
    //location.href = '../403.html';  // 서버에 한번더 요청 403으로 넘어감
}

function onSuccess(r) {
    console.log(r)
}

function onError(err) {
    console.log(err)
}

/*************** event init *****************/
auth.onAuthStateChanged(onAuthChanged);
$('.bt-login').click(onLogin);
$('.bt-logout').click(onLogout);
$('form[name="uploadForm"]').submit(onSubmit);



/*************** start init *****************/

