(function () {
    const cognitoDomain = "ap-southeast-2oe66r4s7y.auth.ap-southeast-2.amazoncognito.com";
    const clientId = "6mpavt9nh6dad8s9p180ebcufq";
    const redirectUri = "https://stephan-parra.github.io/sample-sg-road-data/index.html";
  
    const accessToken = localStorage.getItem("access_token");
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
  
    // 👮 Redirect immediately if user is not logged in and no code is present
    if (!accessToken && !code) {
      const loginUrl = `https://${cognitoDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = loginUrl;
      return; // Stop the rest of the script
    }
  
    // 🔁 Handle OAuth2 redirect with code
    if (code && !accessToken) {
      const data = {
        grant_type: "authorization_code",
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri
      };
  
      const formBody = Object.entries(data)
        .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
        .join("&");
  
      fetch(`https://${cognitoDomain}/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody
      })
        .then(response => response.json())
        .then(tokens => {
          if (tokens.access_token) {
            localStorage.setItem("access_token", tokens.access_token);
            localStorage.setItem("id_token", tokens.id_token);
            console.log("✅ Login successful");
  
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
  
            // Show content
            document.getElementById("app").style.display = "block";
          } else {
            console.error("❌ Token exchange failed", tokens);
          }
        })
        .catch(error => {
          console.error("❌ Token exchange error:", error);
        });
    } else if (accessToken) {
      // ✅ User is already logged in — show content
      document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("app").style.display = "block";
      });
    }
  
    // 🔐 Login Button Setup (optional if used elsewhere)
    document.addEventListener("DOMContentLoaded", () => {
      const loginBtn = document.getElementById("login-btn");
      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
          const loginUrl = `https://${cognitoDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
          window.location.href = loginUrl;
        });
      }
    });
  })();
  