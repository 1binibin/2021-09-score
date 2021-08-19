/*************** global init *****************/
var auth = firebase.auth();
var database = firebase.database();
var storage = firebase.storage();
var googleAuth = new firebase.auth.GoogleAuthProvider();
var dbRoot = database.ref('root/uploads');
var stRoot = storage.ref().child('imgs');
var user = null;
var allowExt = ['jpg', 'jpeg', 'png', 'gif', 'mp4'];

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
    // console.log(r);
    user = r;
    if(user) {
        $('.bt-login').hide();
        $('.bt-logout').show();
        dbRoot.on('child_added', onAdded);
    }
    else {
        $('.bt-login').show();
        $('.bt-logout').hide();
        $('.list-wrap').empty();
        $('.main-img').attr('src', '').hide();
        $('.main-video').attr('src', '').hide();
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
    if(el.files.length && user) {
        var file = document.querySelector('input[name="upfile"]').files[0];  //jq: $('input[name="upfile"]')[0].files, input type file
        if(allowExt.indexOf( file.name.split('.').pop().toLowerCase() ) > -1){
            var savename = genFile();
            var uploader = stRoot.child(savename.folder).child(savename.file).put(file);
            uploader.on('state_changed', onUploading, onUploadError, onUploaded)
        }
        else alert('업로드 가능한 파일은 이미지 또는 mp4영상 입니다.')
    }
    else if(user === null){
        alert('로그인 후 시도해 주세요.');
    }
    else {
        $('input[name="upfile"]').focus();
    }
    
    function onUploading(snapshot) { // snapshot 현재 상태를 뜻함
        console.log('uploading', snapshot.bytesTransferred);    // 파일크기 변하는거
        console.log('uploading', snapshot.totalBytes);  // 파일 크기
        console.log('========================');
        upfile = snapshot;
    }
    
    function onUploaded() {
        upfile.ref.getDownloadURL().then(onSuccess).catch(onError); //getDownloadURL 다운로드 주소
    }
    
    function onUploadError(err) {
        console.log('error', err);
        if(err.code === 'storage/unauthorized') location.href = '../403.html'
        else console.log('error',err);
        //location.href = '../403.html';  // 서버에 한번더 요청 403으로 넘어감
    }
    
    function onSuccess(r) {
        $('.mainp-wrap').addClass('py-5');
        if(file.type.split('/')[0] === 'image'){    // 
            $('.main-img').attr('src', r).show();
            $('.main-video').hide();
        } 
        else if(file.type.split('/')[0] === 'video'){
            $('.main-video').attr('src', r).show();
            $('.main-img').hide();
        }
        var saveData = {    // realtime database에 파일을 올리면서 보내줄 내용
            oriname: file.name,
            savename: savename.file,
            path: r,
            type: file.type,
            size: file.size,
        }
        console.log(file);
        dbRoot.push(saveData);
    }
    
    function onError(err) {
        console.log(err)
    }
}

function onAdded(r) {
    // console.log(r, r.key, r.val());
    html = '<li class="list">'
    if(r.val().type.indexOf('image') > -1 ) {
        html += '<a href="'+r.val().path+'" target="_blank"><img src="'+r.val().path+'"></a>';
    }
    else{
        html += '<a href="'+r.val().path+'" target="_blank"><video src="'+r.val().path+'"></a>';
    }
    html += '</li>'
    $(html).prependTo('.list-wrap')
}

/*************** event init *****************/
auth.onAuthStateChanged(onAuthChanged);
$('.bt-login').click(onLogin);
$('.bt-logout').click(onLogout);
$('form[name="uploadForm"]').submit(onSubmit);



/*************** start init *****************/

