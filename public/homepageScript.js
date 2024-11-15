const publicVapidKey = window.publicVapidKey;
function showModifyForm(taskId) {
    const form = document.getElementById('modify-task-form-' + taskId);
    const modifyBtn = document.getElementById('modify-btn-' + taskId);
    if (form.style.display === 'block') {
        return;
    }
    form.style.display = 'block'; 
    modifyBtn.style.display = 'none'; 
}

function hideModifyForm(taskId) {
    document.getElementById('modify-task-form-' + taskId).style.display = 'none'; 
    document.getElementById('modify-btn-' + taskId).style.display = 'block';
}
document.addEventListener('DOMContentLoaded', function() {
    const subscribeButton = document.getElementById('subscribeButton');
    if (subscribeButton) {
    subscribeButton.addEventListener('click', function() {
        requestNotificationPermission();
        showNotification("You are subscribed!");
    });
    }
});

document.addEventListener('DOMContentLoaded', function(){
    requestNotificationPermission();
});