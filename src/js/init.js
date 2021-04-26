async function detectMetaMask() {
    const provider = await detectEthereumProvider();
    if (provider) {
        startApp(provider);
    } else {
        showError("MetaMask extension is not installed. You cannot use this app until it is installed.");
    }
}

function startApp(provider) {
    if (provider !== window.ethereum) {
        showError("Provider is not MetaMask. Do you have multiple wallets? App cannot be used.");
        return;
    }

    enableButtons();
    bindEvents();
    App.init();
}

function showError(msg) {
    $("#textAlert").html(msg);
    $("#divAlert").removeClass("alert-primary alert-success").addClass("show alert-danger").show();
}

function showInfo(msg) {
    $("#textAlert").html(msg);
    $("#divAlert").removeClass("alert-danger alert-success").addClass("show alert-primary").show();
}

function showSuccess(msg) {
    $("#textAlert").html(msg);
    $("#divAlert").removeClass("alert-danger alert-primary").addClass("show alert-success").show();
}

function closeAlerts() {
    $('.alert').hide();
}

function bindEvents() {
    $("#btnReport").click(App.handleReport);
    $("#btnRetrieve").click(App.handleRetrieve);
    $("#btnAccept").click(App.handleAccept);
    $("#btnReject").click(App.handleReject);
}

function enableButtons() {
    $("button").removeAttr("disabled");
}
function disableButtons() {
    $("button").attr("disabled", "disabled");
}

$(function () {
    $('.alert').on('close.bs.alert', function (e) {
        e.preventDefault();
        $(this).hide();
    });

    detectMetaMask();
});
