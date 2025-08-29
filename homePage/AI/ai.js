function q() {
    let userInPut = document.querySelector("#uip").value;
    if (userInPut !== "") {
        let userInPut11 = document.querySelector("#uip");
        let allert = document.querySelector(".allert");
        let askBtn = document.querySelector("button");
        let inputList = document.querySelector(".userIpBox");
        let li1 = document.createElement("li");

        li1.textContent = userInPut;
        inputList.append(li1);

        let aiList = document.querySelector(".aiResponce");
        let li2 = document.createElement("li");
        // li2.textContent = "Hello I am AI";
        aiList.append(li2);

        fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBV12_wsJIoQThY3ssWi3PiXhd5-zCVCdY", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userInPut }]
                }]
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.candidates && data.candidates.length > 0) {
                    console.log("AI Response:", data.candidates[0].content.parts[0].text);
                    li2.textContent = data.candidates[0].content.parts[0].text;
                }
            })
        userInPut11.style.display = "none";
        askBtn.style.display = "none";
        allert.style.display = "block";
    }
    else {
        alert("Enter the question")
    }
}
