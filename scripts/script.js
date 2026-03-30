function changeColor(element) {
    const body = document.body;
    const isLight = body.classList.toggle("body-light");
    body.classList.toggle("body-dark", !isLight);
    element.classList.toggle("is-light", isLight);
    if (typeof window.setGlobeTheme === "function") {
        window.setGlobeTheme(isLight);
    }
}

function initRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
            } else {
                entry.target.classList.remove("is-visible");
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -12% 0px"
    });

    revealElements.forEach(element => observer.observe(element));
}

function initAnimatedHeader() {
    let width;
    let height;
    const largeHeader = document.getElementById("large-header");
    const canvas = document.getElementById("demo-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    let points = [];
    let target;

    if (!largeHeader || !canvas || !ctx) {
        return;
    }

    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    function createCircle(point) {
        return {
            point,
            radius: 2 + Math.random() * 2,
            active: 0
        };
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = { x: width / 2, y: height / 2 };

        largeHeader.style.width = `${width}px`;
        largeHeader.style.height = `${height}px`;
        canvas.width = width;
        canvas.height = height;
        points = [];

        for (let x = 0; x < width; x += width / 20) {
            for (let y = 0; y < height; y += height / 20) {
                const px = x + Math.random() * (width / 20);
                const py = y + Math.random() * (height / 20);
                const point = {
                    x: px,
                    y: py,
                    originX: px,
                    originY: py,
                    targetX: px,
                    targetY: py,
                    active: 0
                };
                points.push(point);
            }
        }

        points.forEach((point) => {
            const closest = [];

            points.forEach((candidate) => {
                if (point === candidate) {
                    return;
                }

                if (closest.length < 5) {
                    closest.push(candidate);
                    return;
                }

                let farthestIndex = 0;
                for (let i = 1; i < closest.length; i += 1) {
                    if (getDistance(point, closest[i]) > getDistance(point, closest[farthestIndex])) {
                        farthestIndex = i;
                    }
                }

                if (getDistance(point, candidate) < getDistance(point, closest[farthestIndex])) {
                    closest[farthestIndex] = candidate;
                }
            });

            point.closest = closest;
            point.circle = createCircle(point);
        });
    }

    function shiftTargets() {
        points.forEach((point) => {
            point.targetX = point.originX - 50 + Math.random() * 100;
            point.targetY = point.originY - 50 + Math.random() * 100;
        });
    }

    function movePoints() {
        points.forEach((point) => {
            point.x += (point.targetX - point.x) * 0.015;
            point.y += (point.targetY - point.y) * 0.015;

            if (Math.abs(point.targetX - point.x) < 1 && Math.abs(point.targetY - point.y) < 1) {
                point.targetX = point.originX - 50 + Math.random() * 100;
                point.targetY = point.originY - 50 + Math.random() * 100;
            }
        });
    }

    function drawLines(point) {
        if (!point.active) {
            return;
        }

        point.closest.forEach((closePoint) => {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(closePoint.x, closePoint.y);
            ctx.strokeStyle = `rgba(156, 217, 249, ${point.active})`;
            ctx.stroke();
        });
    }

    function drawCircle(circle) {
        if (!circle.active) {
            return;
        }

        ctx.beginPath();
        ctx.arc(circle.point.x, circle.point.y, circle.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = `rgba(156, 217, 249, ${circle.active})`;
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        movePoints();

        points.forEach((point) => {
            const distance = getDistance(target, point);

            if (distance < 4000) {
                point.active = 0.3;
                point.circle.active = 0.6;
            } else if (distance < 20000) {
                point.active = 0.1;
                point.circle.active = 0.3;
            } else if (distance < 40000) {
                point.active = 0.02;
                point.circle.active = 0.1;
            } else {
                point.active = 0;
                point.circle.active = 0;
            }

            drawLines(point);
            drawCircle(point.circle);
        });

        requestAnimationFrame(animate);
    }

    function handleMouseMove(event) {
        const rect = largeHeader.getBoundingClientRect();
        target.x = event.clientX - rect.left;
        target.y = event.clientY - rect.top;
    }

    function handleResize() {
        initHeader();
    }

    initHeader();
    shiftTargets();
    animate();

    if (!("ontouchstart" in window)) {
        window.addEventListener("mousemove", handleMouseMove);
    }
    window.addEventListener("resize", handleResize);
}

const GITHUB_USERNAME = "jportabella";

function updateStat(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function parseLastPage(linkHeader) {
    if (!linkHeader) {
        return null;
    }

    const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
    return match ? Number(match[1]) : null;
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`GitHub request failed: ${response.status}`);
    }

    return response.json();
}

async function renderProjects() {
    const container = document.getElementById("projects");
    if (!container) {
        return;
    }

    const fallbackProjects = [
        {
            name: "Portfolio Website",
            language: "HTML / CSS / JavaScript",
            description: "Personal portfolio focused on clean layout, motion, GitHub integration and interactive visuals.",
            html_url: `https://github.com/${GITHUB_USERNAME}`,
            homepage: "",
            topics: ["frontend", "portfolio", "ui"]
        },
        {
            name: "CS50 Projects",
            language: "Python / Flask / SQL",
            description: "Collection of course projects exploring backend logic, databases and full-stack development fundamentals.",
            html_url: `https://github.com/${GITHUB_USERNAME}`,
            homepage: "",
            topics: ["full-stack", "python", "sql"]
        }
    ];
    const layout = container.dataset.layout;

    container.innerHTML = "";

    let repos = fallbackProjects;

    try {
        const githubRepos = await fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
        repos = githubRepos.filter(repo => !repo.fork);
    } catch (error) {
        console.error("Error loading projects:", error);
    }

    repos.forEach(repo => {
        const div = document.createElement("div");

        if (layout === "showcase") {
            const tech = repo.language || "Codebase";
            const scope = repo.topics && repo.topics.length ? repo.topics.slice(0, 3).join(" / ") : "Personal Project";
            const liveAction = repo.homepage
                ? `<a class="project-action project-action-primary" href="${repo.homepage}" target="_blank" rel="noreferrer">Live Site</a>`
                : "";

            div.classList.add("project-showcase", "reveal", "reveal-up", "is-visible");
            div.innerHTML = `
                <div class="project-media">
                    <div class="project-preview">
                        <span class="project-preview-kicker">Featured repository</span>
                        <h3>${repo.name}</h3>
                        <p>${tech}</p>
                    </div>
                </div>
                <div class="project-content">
                    <h2>${repo.name}</h2>
                    <div class="project-meta">
                        <div>
                            <span class="project-meta-label">Scope</span>
                            <p>${scope}</p>
                        </div>
                        <div>
                            <span class="project-meta-label">Tech</span>
                            <p>${tech}</p>
                        </div>
                    </div>
                    <p class="project-description">${repo.description || "Repository published on GitHub with ongoing work, documentation and source code."}</p>
                    <div class="project-actions">
                        <a class="project-action" href="${repo.html_url}" target="_blank" rel="noreferrer">More Details</a>
                        <a class="project-action" href="${repo.html_url}" target="_blank" rel="noreferrer">
                            <i class="fa-brands fa-github"></i>
                            GitHub
                        </a>
                        ${liveAction}
                    </div>
                </div>
            `;
        } else {
            div.classList.add("project-card");
            div.innerHTML = `
                <h5>${repo.name}</h5>
                <p>${repo.description || "No description"}</p>
                <p>${repo.language || ""}</p>
                <a href="${repo.html_url}" target="_blank" rel="noreferrer">GitHub</a>
            `;
        }

        container.appendChild(div);
    });
}

async function fetchRepoCommitCount(repoName) {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/commits?author=${GITHUB_USERNAME}&per_page=1`);

    if (!response.ok) {
        return 0;
    }

    const commits = await response.json();
    if (!Array.isArray(commits) || commits.length === 0) {
        return 0;
    }

    const lastPage = parseLastPage(response.headers.get("link"));
    return lastPage || commits.length;
}

async function renderGithubStats() {
    const repos = await fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
    updateStat("repos-count", repos.length);

    const mergedData = await fetchJson(
        `https://api.github.com/search/issues?q=is:pr+is:merged+author:${GITHUB_USERNAME}`
    );
    updateStat("merged-count", mergedData.total_count);

    const commitCounts = await Promise.all(
        repos.map(repo => fetchRepoCommitCount(repo.name))
    );
    const totalCommits = commitCounts.reduce((sum, count) => sum + count, 0);
    updateStat("commits-count", totalCommits);
}

async function initGithubData() {
    try {
        await Promise.all([
            renderProjects(),
            renderGithubStats()
        ]);
    } catch (error) {
        console.error("Error loading GitHub data:", error);
        updateStat("repos-count", "1");
        updateStat("commits-count", "3");
        updateStat("merged-count", "0");
    }
}

function initPage() {
    initGithubData();
    initRevealAnimations();
    initAnimatedHeader();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
} else {
    initPage();
}
