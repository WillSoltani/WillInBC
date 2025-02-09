(function() {
    document.addEventListener("DOMContentLoaded", function() {
      // Get the resume pane.
      var pane = document.getElementById("panel-resume");
      if (!pane) {
        console.error("Pane for resume not found (id 'panel-resume')");
        return;
      }
      pane.innerHTML = "";
  
      // Create the title (which we want to keep visible at all times).
      var title = document.createElement("h2");
      title.innerText = "About Will Soltani";
      title.classList.add("resume-title");
      pane.appendChild(title);
  
      // Create the button container and its buttons.
      var buttonContainer = document.createElement("div");
      buttonContainer.id = "resume-buttons";
  
      var resumeBtn = document.createElement("button");
      resumeBtn.innerText = "Resume";
      resumeBtn.classList.add("btn-resume");
  
      var diaryBtn = document.createElement("button");
      diaryBtn.innerText = "Dear Diary";
      diaryBtn.classList.add("btn-resume");
      diaryBtn.addEventListener("click", function() {
        var pwd = prompt("Diary is locked. Please enter the password:");
        if (pwd !== null) {
          if (pwd === "secret") {
            alert("Access Granted! (Decoy Diary)");
          } else {
            alert("Incorrect password!");
          }
        }
        var parent = diaryBtn.parentNode;
        var emoji = document.createElement("span");
        emoji.innerText = "😏";
        emoji.classList.add("diary-emoji");
        parent.replaceChild(emoji, diaryBtn);
        setTimeout(function() {
          if (emoji.parentNode) {
            parent.replaceChild(diaryBtn, emoji);
          }
        }, 2000);
      });
      buttonContainer.appendChild(resumeBtn);
      buttonContainer.appendChild(diaryBtn);
      pane.appendChild(buttonContainer);
  
      // Create the container where the typed resume text will appear.
      var typingContainer = document.createElement("div");
      typingContainer.id = "typing-container";
      pane.appendChild(typingContainer);
  
      // When the resume button is clicked:
      resumeBtn.addEventListener("click", function() {
        // Fade out (and then remove) the button container—but leave the title intact.
        buttonContainer.classList.add("fade-out");
        setTimeout(function() {
          buttonContainer.remove();
          // Scroll the pane into view.
          pane.scrollIntoView({ behavior: "smooth", block: "start" });
          // After a short delay, show the typing container.
          setTimeout(function() {
            typingContainer.style.display = "block";
            var resumeText = "WillSoltani@WillSoltaniWebsite % \n\n# About Me\n\nI came to Canada in 2017 with a passion for tech and a drive to learn. I earned my Associate Degree in Computer Science from Langara College in 2021 and later completed my Bachelor's at UBC. My journey has been all about learning and turning ideas into real solutions.\n\n# My Journey\n\nI've had the chance to work on a variety of projects—from building simple, user-friendly websites and setting up networks for local businesses to solving tricky technical issues for an electric company. I've also gained experience in food service, retail, marketing, and even worked in a dental lab. I’ve teamed up with TechNova and taken on several freelance gigs (mostly remote and on and off). While I can’t share all the project details publicly, I'm happy to connect you with business owners who can vouch for my work.\n\n# What I Do\n\nI offer a range of tech services, including:\n- Software Development: Building custom, reliable solutions.\n- Web Development: Creating modern, responsive websites.\n- Data Analytics: Turning data into useful insights.\n- Cybersecurity: Keeping your digital assets safe.\n- Networking & Systems: Designing and maintaining solid IT setups.\n- Database Management: Organizing and managing your data.\n- Mobile App Development: Developing user-friendly mobile apps.\n\nRight now, until September 2025, my main focus is on software development and networking. I take on in-person projects in the Halifax area and welcome remote work too.(Sorry BC/ON Folks)\n\n# A Few Personal Notes\n\nI love dogs, but I tend to be a bit of a cat person—give me clear instructions and a project brief, and I'll make it my own. I value realistic deadlines and don’t compromise on quality, so if you have an unrealistic timeline, don't expect a straight-up yes. I work well under pressure, but only if it doesn't mean cutting corners.\n\nWhen I'm not coding, you might find me on a snowboard, starting my mornings with Metallica, or winding down with Lana Del Rey at night. I also want Dogecoin to the moon:)\n\n# Let's Connect\n\nIf you have a project in mind or just want to chat about tech and ideas, feel free to reach out. I’d love to connect and see what we can create together.";
            startTyping(resumeText, typingContainer, 27, function() {
              // When typing is finished, create a bottom button container.
              var bottomContainer = document.createElement("div");
              bottomContainer.classList.add("bottom-btn-container");
  
              var backBtn = document.createElement("button");
              backBtn.innerText = "Back to Top";
              backBtn.classList.add("btn-back");
              backBtn.addEventListener("click", function() {
                window.scrollTo({ top: 0, behavior: "smooth" });
              });
  
              var newDiaryBtn = document.createElement("button");
              newDiaryBtn.innerText = "Dear Diary";
              newDiaryBtn.classList.add("btn-new-diary");
              newDiaryBtn.addEventListener("click", function() {
                var pwd = prompt("Diary is locked. Please enter the password:");
                if (pwd !== null) {
                  if (pwd === "secret") {
                    alert("Access Granted! (Decoy Diary)");
                  } else {
                    alert("Incorrect password!");
                  }
                }
                var parent = newDiaryBtn.parentNode;
                var emoji = document.createElement("span");
                emoji.innerText = "😏";
                emoji.classList.add("diary-emoji");
                parent.replaceChild(emoji, newDiaryBtn);
                setTimeout(function() {
                  if (emoji.parentNode) {
                    parent.replaceChild(newDiaryBtn, emoji);
                  }
                }, 2000);
              });
  
              bottomContainer.appendChild(backBtn);
              bottomContainer.appendChild(newDiaryBtn);
              pane.appendChild(bottomContainer);
            });
          }, 600);
        }, 600);
      });
  
      // --- Auto-Expand Resume Pane Logic ---
  
      // Function to adjust the resume pane's height based on its content.
      function adjustResumePaneHeight() {
        const resumePane = document.getElementById("panel-resume");
        if (resumePane) {
          // Reset height so that scrollHeight reflects the full content.
          resumePane.style.height = "auto";
          // Set the height to the full scrollHeight.
          resumePane.style.height = resumePane.scrollHeight + "px";
        }
      }
  
      // Call adjustResumePaneHeight on window resize.
      window.addEventListener("resize", adjustResumePaneHeight);
      // Call it once initially.
      adjustResumePaneHeight();
  
      // Use a MutationObserver to auto-adjust height when pane content changes.
      const resumePaneObserver = document.getElementById("panel-resume");
      if (resumePaneObserver) {
        const observer = new MutationObserver(() => {
          adjustResumePaneHeight();
        });
        observer.observe(resumePaneObserver, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
  
      // Typing effect function that adds text to the container one character at a time.
      function startTyping(text, container, speed, callback) {
        container.innerText = "";
        let index = 0;
        const interval = setInterval(() => {
          container.innerText += text.charAt(index);
          index++;
          if (index >= text.length) {
            clearInterval(interval);
            // Append a blinking cursor.
            const cursor = document.createElement("span");
            cursor.innerText = "|";
            cursor.style.animation = "blink 1s step-start infinite";
            container.appendChild(cursor);
            // Adjust pane height after typing.
            adjustResumePaneHeight();
            if (typeof callback === "function") {
              callback();
            }
          }
        }, speed);
      }
    });
  })();
  