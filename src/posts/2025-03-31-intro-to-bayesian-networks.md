---
title: "Introduction to Bayesian Networks"
date: "2025-03-31"
layout: "post.njk"  # Must match exactly with `post.njk`
author: "Sivakumar Balasubramanian"
tags: ["blog"]
---
<link rel="stylesheet" href="{{ '/assets/css/2025-03-31-bn.css' | url }}">

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.1/math.min.js"></script>

<script>
  // Wait for the page to fully reload after live-reload
  document.addEventListener("DOMContentLoaded", function () {
    if (window.MathJax && window.MathJax.typeset) {
      MathJax.typeset();
    }
  });
</script>

<!-- Bayes Rule Discrete Interactive Demo -->
<!-- ==================================== -->
<script>
  // Event handlers
  // Function to update the corresponding span label
  function updateSliderLabel(slider) {
      const valueDisplay = document.getElementById(slider.id + "-value");
      if (valueDisplay) {
          valueDisplay.textContent = slider.value;
      }
  }

  // Function to handle checkbox state change
  function updateTestCheckboxLabel(checkBox) {
      document.getElementById("binary-test-result-value").textContent = checkBox.checked ? "Test is +ve" : "Test is -ve";
  }

  // Posterior probability calculation
  function updatePosteriorProbability() {
      // Get the slider values
      const pPrior = parseFloat(document.getElementById("prior-prob-slider").value);
      const pTruePos = parseFloat(document.getElementById("true-positive-slider").value);
      const pFalsePos = parseFloat(document.getElementById("false-positive-slider").value);
      const testResult = document.getElementById("binaryTestResult").checked ? 1 : 0;

      // Compute proability of the test result.
      pTest = calculateTestProbability(testResult);

      // Calculate the posterior probability
      var pPosterior = testResult == 1 ?  (pTruePos * pPrior) / pTest : ((1 - pTruePos) * pPrior) / pTest;
      document.getElementById("posterior-prob-value").textContent = `p(D=1 | T=${testResult}) = ${pPosterior.toFixed(5)}`;
  }

  // Compute test probability
  function calculateTestProbability(testResult) {
      // Get the slider values
      const pPrior = parseFloat(document.getElementById("prior-prob-slider").value);
      const pTruePos = parseFloat(document.getElementById("true-positive-slider").value);
      const pFalsePos = parseFloat(document.getElementById("false-positive-slider").value);

      // Calculate the probability of the test result
      const pTest = pTruePos * pPrior + pFalsePos * (1 - pPrior);
      return testResult == 1 ? pTest : 1 - pTest;
  }

  // Functions to read and update the Baye rule demo div segment's controls.
  document.addEventListener("DOMContentLoaded", function () {
      // Select all sliders
      const sliders = document.querySelectorAll(".slider");
      // Select the checkbox
      const testResultCheckbox = document.getElementById("binaryTestResult");

      // Attach event listeners to all sliders
      sliders.forEach(slider => {
          // Initialize labels with the current values
          updateSliderLabel(slider);

          // Update value when the slider is moved
          slider.addEventListener("input", function () {
              updateSliderLabel(slider);
              // Call the posterior probability function
              updatePosteriorProbability();
          });
      });

      // Initialize label for the checkbox. 
      updateTestCheckboxLabel(testResultCheckbox);

      // Attach an event listener
      testResultCheckbox.addEventListener("change", function() {
        updateTestCheckboxLabel(testResultCheckbox);
        // Call the posterior probability function
        updatePosteriorProbability();
      });

      // Call the posterior probability function
      updatePosteriorProbability();
  });
</script>

Almost all real-world problems require us to deal with: (a) multiple variables with complex interactions, (b) each variable has some uncertainity associated with it, and (c) some decision making based on some partially observed or available information. Bayesian networks ?is a powerful tool that can help us represents such complex systems, and provide principled approach for make informed decisions. In this post, we will provide a short introduction to Bayesian networks, and show how they can be used to model complex systems and make decisions under uncertainty. Bayesian networks are a type of probabilistic graphical models and are a stepping stone to causal inference --  an interesting, complex, and useful topic of interest to the author.

<h2 class="post-subtitle">Some basic probability concepts</h2>

Let's start by stating some basic probabilistic concepts. Let a random variable $X$ which takes on some values from its domain $\text{dom}(X)$. Let $0 \leq p(X = x) \leq 1$ is the probability that the random variable $X$ takes on the value $x \in \text{dom}(X)$.

$$
\sum_{x_i \in \text{dom}(X)} p(x_i) = 1
$$

This is the normalization condition. If $X$ is a continuous random variable, this condition is $$\int_{-\infty}^{\infty} p(x) dX = 1$$

When we have two random variables $X$ and $Y$, the <i>joint probability distribution</i> is denoted by $p(X=x, Y=y)$ or $p(x, y)$. The joint probability distribution is the probability that both $X$ and $Y$ take on the values $x$ and $y$, respectively.

The <i>marginal</i> of a joint distribution is given by,

$$
p(x) = \sum_{y} p(x, y) \quad \text{and} \quad p(y) = \sum_{x} p(x, y) 
$$

Marginal probabilities tell us the probability of the individual random variables, irrespective of the other. <i>Conditional probability</i> tells us the probability of one random variable, when the value of another random variable is known. The conditional probability of $X$ given $Y$ is denoted by $p(X=x \vert Y=y)$ or $p(x \vert y)$ and is given by,

$$
p\left(x \\, \vert \\, y\right) = \frac{p\left(x, y\right)}{p\left( y \right)}, \quad p(y) \neq 0
$$

The reader must note the following points.

1. $p( x \vert y)$ can be thought of a function of $x$ for given values of $y$.
2. $\sum_{x} p( x \\, \vert \\, y) = 1$, which mean that $p(x \\, \vert \\, y)$ is a valid probability distribution. This property is due to the normalization of the joint probability distribution by $p( y )$.
3. $p(y) \neq 0$ is necessary because, if $p(y) = 0$ then then the random variable $Y$ cannot take on the value, so the conditional probability is not defined. Here is a simple example to understand conditional probability.

<div class = "example-box">

<strong>Example 1:</strong> Let's assume we have two indentical bags - $B1$ and $B2$. $B1$ contains 10 red balls and $B2$ contains 10 blue balls. If we randomly choose between $B1$ and $B2$, with equal probability, and choose a ball from the chosen bag. What is the probability that the chosen ball is red? This would be $p( \text{ball} = red) = 0.5$. Why? 

Now if you are told that the chosen bag is $B1$, then what is the proability that the ball is red with chosen bag being $B1$? $p( \text{ball} = red \\, \vert \\, \text{bag} = B1) = 1$! Why?

Note what happened. If we had not information about anything in this problem, the probability of choosing a red ball is 0.5. That is we are equally uncertain about which ball was chosen. However, if we find out which bag was chosen, then our uncertainity changes. In fact, in this case we are certain that the choen ball is red, since the bag $B1$ was chosen.

What would happen if we learned instead that the chosen bag is $B2$?
</div>

<strong> Baye's Rule </strong> is a very important concept in probability theory, and a crucial part of Bayesian networks. The names Bayesian networks comes from the fact that they are based on Baye's rule. Baye's rule is given by,

$$
p( x \\, \vert \\, y) = \frac{p( y \\, \vert \\, x) p(x)}{p(y)} \quad, p( y ) \neq 0
$$

This very simple rule has numerous applications, and in fact has an intuitive interpretation. The rule tells us how to update our belief or the uncertainity about an event $x$ given some evidence $y$. $p(x)$ is called the <i>prior</i> probability, which is a measure of belief about the event $x$ without any other information. $p(y \\, \vert \\, x)$ is the <i>likelihood</i> of the evidence $y$ given $x$, which is out belief about observing the data or information $y$ if event $x$ happens. $p(y)$ is the <i>marginal likelihood</i> of the evidence, and $p(x \\, \vert \\, y)$ is the <i>posterior</i> probability of $x$ given $y$. The posterior probability is our updated belief about the event $x$ given the evidence $y$.

<h3 class="post-subsubtitle">Baye's Rule Interactive Demo</h3>

Let's look at an interactive demonstration of Baye's rule. The following interactive demo of a commonly used "medical" example of the Baye's rule. We have a subject who take a test $T$ for a disease $D$. The test outcome and the disease state are binary random variables; the test outcome is positive (1) or negative (0), and the subject can either have (1) or not have (0) the disease. The disease has an incidence rate of $p(D = 1)$ in the population - the <i>prior probability</i>. The test for the disease is not perfect; it has a some known <i>true positive rate</i> $p(T = 1 \\, \vert \\, D = 1)$ and a <i>false positive rate</i> $p(T = 1 \\, \vert \\, D = 0)$. The following demo allows us to compute the <i>posterior proability</i> of the subject having the disease after we know the test result, i.e., $p( D = 1 \\, \vert \\, T = 1)$ or $p( D = 1 \\, \vert \\, T = 0)$. In the following interactive demo, you can change the prior probability of the disease, the true positive rate, the false positive rate, and the test result to see how the posterior probability changes.

<div id="bayes-rule-discrete-demo">
  <!-- Prior Probability -->
  <div class="bndiscdemo-section">
    <div class="bndiscdemo-title">Prior Probability</div>
    <div class="bndiscdemo-controls">
      <label for="prior-prob-slider">$p(D=1)$</label>
      <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="prior-prob-slider">
      <span id="prior-prob-slider-value">0.5</span>
    </div>
  </div>

  <!-- True Positive Rate -->
  <div class="bndiscdemo-section">
    <div class="bndiscdemo-title">True Positive Rate</div>
    <div class="bndiscdemo-controls">
      <label for="true-positive-slider">$p(T = 1 \vert D=1)$</label>
      <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="true-positive-slider">
      <span id="true-positive-slider-value">0.5</span>
    </div>
  </div>

  <!-- False Positive Rate -->
  <div class="bndiscdemo-section">
    <div class="bndiscdemo-title">False Positive Rate</div>
    <div class="bndiscdemo-controls">
      <label for="false-positive-slider">$p(T = 1 \vert D=0)$</label>
      <input type="range" min="0" max="1" value="0.5" step="0.01" class="slider" id="false-positive-slider">
      <span id="false-positive-slider-value">0.5</span>
    </div>
  </div>

  <!-- Test Result (Checkbox) -->
  <div class="bndiscdemo-section">
    <div class="bndiscdemo-title">Test Result</div>
    <div class="bndiscdemo-controls" id="bndiscdemo-test-result">
      <label>
        <input type="checkbox" id="binaryTestResult"> $T$ Positive?
      </label>
      <span id="binary-test-result-value">-</span>
    </div>
  </div>
</div>

<!-- Posterior Probability Output -->
<div class="bndiscdemo-output">
  Posterior Probability: <span id="posterior-prob-value"> - </span>
</div>

You can play around with the sliders above to compute the posterior probability of a person having the disease when the test comes out positive or negative. Answer the following questions using the interactive demo to get an intuitive understanding of Baye's rule.
<div class="question-box">
<ol class="question">
  <li>When does the posterior probability equal the prior probability? Can you explain why it is so?</li>
  <li>When does the test result perfectly correlate with disease status? i.e., testing positive confirms the disease and vice versa. What about the other way around? Positive test implies no disease, and vice versa.</li>
</ol>
</div>

Bayes' rule can be used to update and obtain the full posterior probability distribution of a random variable of interest, given some evidence. Suppose you find a coin on the street and we want to know if this is a fair coin. The coin looks like a regular coin. So you believe that this coin is likely to be a fair coin, with the following prior probability distribution for the parameter $p$ - the probability of the coin landing heads up. Notice, here that $p$ is itself a random variable because of our uncertainity about its exact value. All we know is that its value is between 0 and 1. The Beta function is used to model the prior distribution of the parameter $p$. The Beta distribution is a continuous probability distribution defined on the interval $[0, 1]$. The Beta distribution is defined by two parameters $\alpha$ and $\beta$, which allow one to control the shape of the distribution. We toss the coin twenty times and depending on the number of head observed from this experiment, the posterior distribution changes. The following interactive demo shows how the prior (light red) and posterior (blue) distribution of the parameter $p$ changes as we observe more heads.

<div class="container" id="bayesrule-coin-demo">
    <!-- Left: Controls -->
    <div class="controls">
        <h3>Bayesian Coin Flip</h3>
        <label>Prior Distribution Parameter α (Heads): <span id="prior-alpha-value">2</span>
        <input type="range" id="prior-alpha" min="1" max="10" value="2"></label>
        <label>Prior Distribution Parameter β (Tails): <span id="prior-beta-value">2</span>
        <input type="range" id="prior-beta" min="1" max="10" value="2"></label>
        <label>Observed Heads: <span id="obs-heads-value">0</span>
        <input type="range" id="obs-heads" min="0" max="20" value="10"></label>
    </div>
    <!-- Right: Chart -->
    <div class="chart-container">
        <svg width="500" height="250" viewBox="0 0 500 280" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
</div>

<!-- Bayes Rule Coin Interactive Demo -->
<!-- ================================ -->
<script>
    // Function to compute the Beta distribution
    function betaPDF(x, alpha, beta) {
        function gamma(n) { return n === 1 ? 1 : (n - 1) * gamma(n - 1); }
        const B = (gamma(alpha) * gamma(beta)) / gamma(alpha + beta);
        return (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) / B;
    }

    // Set up SVG canvas
    const svg = d3.select(".chart-container svg"),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
                     .domain([0, 1])
                     .range([0, plotWidth]);
    const yScale = d3.scaleLinear()
                     .domain([0, 5])
                     .range([plotHeight, 0]); // Adjusts dynamically

    // X Axis
    g.append("g")
     .attr("transform", `translate(0,${plotHeight})`)
     .attr("class", "x-axis")
     .call(d3.axisBottom(xScale))
     .selectAll("text") // Select all tick labels
     .style("font-size", "14px")  // Set font size
     .style("font-family", "Inter")  // Set font type
     .style("fill", "black");  // Set text color;
    // X-axis Label
    g.append("text")
     .attr("class", "x-axis-label")
     .attr("x", plotWidth / 2)
     .attr("y", plotHeight + margin.bottom + 20)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("font-family", "Inter")
     .style("fill", "black")
     .text("Probability of Heads (p)");
    // Y Axis
    g.append("g")
     .attr("class", "y-axis")
     .call(d3.axisLeft(yScale))
     .selectAll("text") // Select all tick labels
     .style("font-size", "14px")  // Set font size
     .style("font-family", "Inter")  // Set font type
     .style("fill", "black");  // Set text color;;

    // Line generators
    const line = d3.line()
                   .x(d => xScale(d.x))
                   .y(d => yScale(d.y));

    // Paths for prior and posterior
    const priorPath = g.append("path")
                       .attr("fill", "none")
                       .attr("stroke", "red")
                       .attr("stroke-width", 2)
                       .attr("stroke-opacity", 0.5);
    const posteriorPath = g.append("path")
                           .attr("fill", "none")
                           .attr("stroke", "steelblue")
                           .attr("stroke-width", 3);
    const legend = g.append("g")
                    .attr("transform", `translate(20, 10)`); // Position legend

    // Define legend items
    const legendItems = [
      { label: "Prior PDF", color: "red", strokeWidth: 2, opacity: 0.5 },
      { label: "Posterior PDF", color: "steelblue", strokeWidth: 3, opacity: 1 }
    ];

    // Create a group for each legend item
    const legendGroups = legend.selectAll(".legend-item")
                               .data(legendItems)
                               .enter()
                               .append("g")
                               .attr("class", "legend-item")
                               .attr("transform", (d, i) => `translate(${i * 100}, 0)`); // Space out items

    // Add colored legend lines
    legendGroups.append("line")
                .attr("x1", 0)
                .attr("y1", 5)
                .attr("x2", 20)
                .attr("y2", 5)
                .attr("stroke", d => d.color)
                .attr("stroke-width", d => d.strokeWidth)
                .attr("stroke-opacity", d => d.opacity);

    // Add text labels
    legendGroups.append("text")
                .attr("x", 30)
                .attr("y", 10)
                .style("font-size", "14px")
                .style("font-family", "Inter")  // Set font type
                .text(d => d.label);
    
    function updatePlot() {
        // Read slider values
        const priorAlpha = +document.getElementById("prior-alpha").value;
        const priorBeta = +document.getElementById("prior-beta").value;
        const obsHeads = +document.getElementById("obs-heads").value;
        const N = +document.getElementById("obs-heads").max;
        const obsTails = N - obsHeads;

        // Compute posterior parameters
        const postAlpha = priorAlpha + obsHeads;
        const postBeta = priorBeta + obsTails;

        // Update displayed values
        document.getElementById("prior-alpha-value").textContent = priorAlpha;
        document.getElementById("prior-beta-value").textContent = priorBeta;
        document.getElementById("obs-heads-value").textContent = `${obsHeads}/${N}`;

        // Generate data points for prior and posterior
        const data = d3.range(0.001, 1.001, 0.001).map(x => ({
            x,
            prior: betaPDF(x, priorAlpha, priorBeta),
            posterior: betaPDF(x, postAlpha, postBeta)
        }));

        // Update y-scale
        yScale.domain([0, d3.max(data, d => Math.max(d.prior, d.posterior)) * 1.2]);

        // Update axes
        svg.select(".y-axis")
           .transition()
           .duration(200)
           .call(d3.axisLeft(yScale))
           .selection()
           .selectAll("text")
           .style("font-size", "14px")
           .style("font-family", "Inter")
           .style("fill", "black");

        // Update prior plot
        priorPath.datum(data)
                 .transition()
                 .duration(200)
                 .attr("d", d3.line().x(d => xScale(d.x)).y(d => yScale(d.prior)));

        // Update posterior plot
        posteriorPath.datum(data)
                     .transition()
                     .duration(200)
                     .attr("d", d3.line().x(d => xScale(d.x)).y(d => yScale(d.posterior)));
    }

    // Event Listeners
    d3.selectAll("input").on("input", updatePlot);

    // Initial plot
    updatePlot();
</script>

Play around with the sliders above and observe the changes in the prior and posterior distribution of the parameter $p$. Do the results make intuitive sense?

<h2 class="post-subtitle">Mutlivariate problems with uncertainty</h2>

With that brief background on Baye's theorem we now head towards the main topic of this post.

Let's assume that we are dealing with $n$ random variables $X_1, X_2, \ldots, X_n$ for the problem of interest. Given that the problem is stochastic in nature, the best piece of information we can have about the problem is the joint probability distribution of these random variables, i.e. $p\left( X_1, X_2, \cdots X_n\right)$. All other information that can be known about this problem can be derived from the joint probability distribution. If want to use a computer to compute the information of interest, we first need to be able to represent and store the joint probability distribution. That is the first issue we need to confront -  the representation of this joint probability distribution in a computer. Let's answer the following question to understand this issue:

<div class="question-box">
<ul class="question">
  <li>How many parameters (or numbers) do you need to represent a discrete probability distribution of a random variable $X$ that takes on $k$ possible discrete values $x_1, x_2, x_3 \ldots x_k$?</li>
</ul>
</div>

It's $k-1$ numbers, which can be $p(x_1), p(x_1), \ldots p(x_{k-1})$. The last number is determined by the normalization condition, i.e. $\sum_{i=1}^{k} p(x_i) = 1$. Now, let's consider multivariate.<br>

<div class="question-box">
<ul class="question">
  <li>How many parameters do you need to represent a discrete joint probability distribution of two binary random variables $X_1$ and $X_2$ that take on values $0$ or $1$?</li>
</ul>
</div>

Here, we will need 3 numbers. In fact, if we have a joint probability distribution of $n$ binary random variables, then, we need at most $2^n -1$ numbers to fully represent this joint probability distriubtion.

You see the problem here. The number of parameters required grows exponentially with the number of variables. If we were dealing with a moderately sized problem with 100 binary random variales, we will need $2^{100} - 1 = 1,267,650,600,228,229,401,496,703,205,375$ parameters! The is a ridiculously large number. Forget about using such a distribution for inference, we cannot even represent this fully on a computer!

<div class="question-box">
<ul class="question">
  <li>What about a joint distribution of $n$ variables with each random variable taking on $k$ distinct values? I leave this for you to work out, and you will see the general issue here.</li>
</ul>
</div>

For $n$ binary random variables, we said we will at most need $2^n - 1$ numbers to represent the probability distribution. This is when there is dependence between $n$ random variables, which requires all $2^n - 1$ numbers to caputure all the possible dependencies or interactions. However, if there is any sort of "independence" between one or more of the random variables, then the number of parameters requires to represent the joint probability distribution can be reduced. To put this idea on firm footing, let's first clearly define the concept of independence in probability setting.

<b>Independence</b> 

Two random variables $X$ and $Y$ are independent if the knowledge or information about one variable does not affect our knowledge about the other variable. This is most naturally expressed in terms of conditional probability. Two random variables are independent if the conditional probability distribution of one random variable given the other is equal to its marginal probability distribution. 
$$
p(x \vert y) = p(x) \quad \forall x, y
$$

Our uncertainity about the value of $X$ without any other information is $p(X=x)$. Knowing the values of $Y$ does not change our uncertainity about the value of $X$, when $X$ and $Y$ are independent. Note that independence is a symmetric property.
$$
p(x \vert y) = p(x) \iff p(y \vert x) = p(y) \quad \forall x, y
$$
This implies that, $p(x, y) = p(x) p(y)$, $\forall x, y$. Its trivial to verify this. Independence between random variables $X$ is often represented as $X \perp\\!\\!\\!\perp Y$. When two two random variables are not independent, we say that they are dependent, which is represented as $X \not\\!\perp \\!\\!\\!\perp Y$.

This independence is also known as <i>unconditional independence</i>. Another important and interesting type of independence is <i>conditional independence</i>.

Let's look at some exmaples to understand the concept of independence.

<div class="example-box">

<strong>Example 2:</strong> The age of a first year MS Bioengineering student and his/her grade in Applied Linear Algebra course are two random variables. The age of the student does not affect his/her grade in the course. Thus, these two random variables are independent. Similarly, the gender of the student and his/her grade in the course are independent.

<strong>Example 3:</strong> A person's age and his/her blood group can be safely assumed to be independent random variables, i.e. 
$$p(\text{Age} \vert \text{Blood Type}) = p(\text{Age}), \\,\\, \forall \text{Age}, \\,\text{Blood Type}$$
The following is the demonstration of this from a real dataset from <a href="https://www.kaggle.com/datasets/prasad22/healthcare-dataset/versions/1?resource=download#">Kaggle</a> with data from 10000 subjects. The following plot shows the conditional probability distribution of the age of the subjects given their blood type, along with the marginal probability distribution of the age. We see that these distributions look essentially the same; they will never be exactly equal because of sampling noise. A $\chi^2$ test of independence on the data shows that the two random variables are independent.
<!-- Image from the analysis folder with center alignment -->
<img src="{{ '/assets/images/2025-03-31/age-bloodtype.svg' | url }}" alt="Independence" class="example-image" width="400" style="display: block; margin: 0 auto;">

<strong>Example 4:</strong>Two Gaussian random variables $X$ and $Y$ are independent if and only if their joint distribution is given by the product of their marginals. If we randomly sample $X$ and $Y$ from a joint Gaussian distribution, we get a scatter plot as the following left plot, where there appear to be no trend or correlation between the two random variables.
<!-- Image from the analysis folder with center alignment -->
<img src="{{ '/assets/images/2025-03-31/gaussrandvar.svg' | url }}" alt="Independence" class="example-image" width="500" style="display: block; margin: 0 auto;">

On the other hand, the scatter plot on the right shows a case where the two random variables are dependent. Can you explain why using the basic definition of independence?

</div>

<b>Conditional Independence</b>

Two variables $X$ and $Y$ may not be independent, but might become independent when we have knowledge of a third variable $Z$. The uncertainty about $X$ given $Y$ and $Z$ is the same as the uncertainty about $X$ given only $Z$. 
$$
p(x \vert y, z) = p(x \vert z) \quad \forall x, y, z
$$
Notice, that conditional independence is also symmetric. 
$$
p(x \vert y, z) = p(x \vert z) \iff p(y \vert x, z) = p(y \vert z) \quad \forall x, y, z
$$

This also implies that $p(x, y \vert z) = p(x \vert z) p(y \vert z)$, $\forall x, y, z$. Conditional independence is often represented as $X \perp\\!\\!\\!\perp Y \vert Z$.

Let's look at some exmaples to understand the concept of independence.

<div class="example-box">

<strong>Example 5:</strong> Two repeated administration of a diagnostic test $T$ on a subject are not indepedent. The outcomes in the two tests $T_1$ (test 1) and $T_2$ (test 2) are random variables and they will be correlated. Let's simulate this and understand this. Let this diagnostic test be a binary test with a true positive rate of $0.9$ and a false positive rate of $0.05$. Let the prevalence of the disease of interest be $0.1$. We administered this test twice on 1000 subjects who came to the hospital. Each of these patients either has or does not have the disease, which too is a random variable, which we call $D$. Comparing the outcomes of the two tests, we get the following joint probability distribution on the left. The right plot shows the conditional probability distribution of $T_2$, given the outcome of $T_1$.
<!-- Image from the analysis folder with center alignment -->
<img src="{{ '/assets/images/2025-03-31/testretestcm1.svg' | url }}" alt="Independence" class="example-image" width="450" style="display: block; margin: 0 auto;">

We can clearly see that the $p(T_2 \vert T_1) \neq p(T_2)$, implying they are not unconditionally independent. If someone tested positive in the first test, they are more likely to test positive on the second test as well.

Ask yourself this question. If through some measns, we got to know the true disease status of a subject, are the two tests $T_1$ and $T_2$ still dependent? Let's look at what the data says. The following plots show the conditional probabiity distribution $p(T_2 \vert T_1, D=1)$ and $p(T_2 \vert T_1, D=0)$, on the left and right, respectively. You can see that knowledge of $T_1$ once we know the disease does not change our uncertainity about $T_2$, which is essentially p(T_2$).
<!-- Image from the analysis folder with center alignment -->
<img src="{{ '/assets/images/2025-03-31/testretestcm2.svg' | url }}" alt="Independence" class="example-image" width="450" style="display: block; margin: 0 auto;">

One we know the disease status, we cannot learn anything about the results of $T_2$ from $T_1$.

</div>

<h2 class="post-subtitle">Representation of Multivariate Distributions</h2>

We earlier saw that a joint distribution with $N$ binary random variables requires at most $2^{N}-1$ variables for its complete speicfication. This is the most general case, where each of the $N$ variables is dependent on other random variables. This sentence is not clear!? If these names these random variables $X_1, X_2, \ldots, X_N$, then the joint distribution can be written as the following,
$$
p(x_1, x_2, \ldots, x_N) = p(x_N \vert x_{N-1}, x_{N-2}, \ldots, x_1) p(x_{N-1} \vert x_{N-2}, \ldots, x_1) \cdots p(x_{2} \vert x_1) p(x_1)
$$
This is the <i>chain rule</i> of probability distributions, where the joint distribution is expressed as the product of a set of conditional distributions. The chain rule written above is the most general form of the rule, which allows for all possible dependencies between the random variables. If we can specify each of these conditional distributions, then we can compute the joint distribution. There are $N$ product terms on the right hand side (RHS), and its easy to verify that the sum of the parameters required for each of these conditional distribution is $2^N - 1$. The following table shows the number of parameters required to represent the joint distribution of $N$ binary random variables, and the number of product terms in the chain rule.
<div class="centered-table">
<table>
  <thead>
    <tr>
      <th>Term in the RHS</th>
      <th>Number of Parameters</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$p(x_1)$</td>
      <td>$1$</td>
    </tr>
    <tr>
      <td>$p(x_2 \vert x_1)$</td>
      <td>$2$</td>
    </tr>
    <tr>
      <td>$p(x_3 \vert x_2, x_1)$</td>
      <td>$4$</td>
    </tr>
    <tr>
      <td>$\vdots$</td>
      <td>$\vdots$</td>
    </tr>
    <tr>
      <td>$p(x_N \vert x_{N-1}, x_{N-2}, \ldots, x_1)$</td>
      <td>$2^{N-1}$</td>
    </tr>
  </tbody>
</table>
</div>

You can verify that $\sum_{i=0}^{N-1} 2^i = 2^N - 1$.

What would happen if the $N$ random variables are independent? If each one is independent, then the joint distribution can be written as the product of the marginals.
$$
p(x_1, x_2, \ldots, x_N) = p(x_1) p(x_2) \cdots p(x_N)
$$

This is the simplest possible case. We only need $N$ parameters to represent the joint distribution.

Often in practice, we neither have full independece or full dependence between the random variables. Conditional independence between variables betows bestows? structure to a joint distribution, allowing us to have a compact representation for joint probability distributions. 

<h2 class="post-subtitle">Bayesian Networks</h2>

<b>Bayesian Networks</b> are a nice, graphical way to represent conditional independence between random variables, that allows us to compactly represent joint distributions, and provides algorithms for making probabilistic inferences from data. Bayesian networks are also often called <i>belief networks</i> or <i>Bayesian belief networks</i>. 

A Bayesian network is a directed acyclic graph (DAG) where the nodes are random variables and the edges represent the conditional dependencies between the random variables. The direction of the edge indicates the direction of the dependency. The choice of the edges in a Bayesian network are based on the conditional independence realtionships between the random variables of interest.

The following figures shown some examples of Bayesian networks (BNs) with three random variables.

<div class="centered-table-noborder">
<table>
  <thead>
    <tr>
      <th>BN 1</th>
      <th>BN 2</th>
      <th>BN 3</th>
      <th>BN 4</th>
      <th>BN 5</th>
    </tr>
  </thead>
  <tbody>
    </tr>
    <tr>
      <td>
      <img src="{{ '/assets/images/2025-03-31/graph1.svg' | url }}" alt="Graph1" class="graph1" width="150" style="display: block; margin: 0 auto;">
      </td>
      <td>
      <img src="{{ '/assets/images/2025-03-31/graph2.svg' | url }}" alt="Graph1" class="graph1" width="150" style="display: block; margin: 0 auto;">
      </td>
      <td>
      <img src="{{ '/assets/images/2025-03-31/graph3.svg' | url }}" alt="Graph1" class="graph1" width="150" style="display: block; margin: 0 auto;">
      </td>
      <td>
      <img src="{{ '/assets/images/2025-03-31/graph4.svg' | url }}" alt="Graph1" class="graph1" width="150" style="display: block; margin: 0 auto;">
      </td>
      <td>
      <img src="{{ '/assets/images/2025-03-31/graph5.svg' | url }}" alt="Graph1" class="graph1" width="150" style="display: block; margin: 0 auto;">
      </td>
    </tr>
  </tbody>
</table>
</div>

The BNs shown above are five possible examples of BNs with three random variables. The following are some graph therapy definitions that will be useful when talking about BNs:
<ol>
  <li><b>Node:</b> The circles (with text) shown in the above graphs.</li>
  <li><b>Edge:</b> The arrows between two nodes of the graph. The arrows represent the conditional dependencies between the random variables; the direction of the arrow is often based on causal dependency, but this is not necessary in BN.
  <li><b>Directed path:</b> A <i>directed path</i> from node $A$ to node $B$ is a sequence of nodes $A = v_0 \rightarrow v_1 \rightarrow v_2 \rightarrow \cdots \rightarrow v_k = B$ such that each consecutive pair $(v_i, v_{i+1})$ has a directed edge in the graph (i.e., the arrow points from $v_i$ to $v_{i+1}$).
  <li><b>Child node:</b> A node $B$ is a <i>child</i> of $A$, if there is an arrow (directed edge) from $A$ to $B$, i.e. $A \longrightarrow B$. For example, in BN2, $X_2$ and $X_3$ are children of $X_3$.
  <li><b>Parent node:</b> A node $A$ is a <i>parent</i> of $B$, if there is an arrow (directed edge) from $A$ to $B$, i.e. $A \longrightarrow B$. For example, in BN3, $X_1$ is the parent of $X_2$ and $X_2$ is parent of $X_3$. The set of all nodes that are parents of a node $X$ is represented by $\text{pa}(X)$. In BN4, $\text{pa}(X_2) = \{ X_1 \}$, and in BN5, $\text{pa}(X_1) = \{ X_2, X_3\}$.
  <li><b>Ancestor node:</b> A node $A$ is an <i>ancestor</i> of a node $B$, if there is a directed path from $A$ to $B$.</li> In BN3, the nodes $X_1$ and $X_2$ are ancestors of $X_3$.
  <li><b>Markov blanket:</b> A <i>Markov blanket</i> of a node is the set of all nodes that that include its parents, its children, and the other parents of its children.</li>
</ol>

The joint probability distribution of a BN can be written as the product of the conditional probability distributions of each node given its parents.
$$
p(x_1, x_2, \ldots, x_N) = \prod_{i=1}^{N} p(x_i \vert \text{pa}(x_i))
$$
$\text{pa}(x_i)$ is the set of all parent nodes of node $x_i$. The number of parameters required to represent the joint distribution of a BN is equal to the sum of the number of parameters required to represent each conditional distribution. Assumning all random variables are binary, the number of parameters required to represent a conditional distribution $p(x_i \vert \text{pa}(x_i))$ is equal to $2^{\\#\text{pa}(x_i)} - 1$, where $\\#\text{pa}(x_i)$ is the number of parent nodes of node $x_i$.  

We are now ready to analyze the BNs shown above. 

<table class="bn-table">
  <tr class="bn-row">
    <td>
      <img src="{{ '/assets/images/2025-03-31/graph1.svg' | url }}" alt="BN1" class="bn-image">
    </td>
    <td class="bn-text">
      All nodes are independent, unconditionally.
      $$
      p(x_1, x_2, x_3) = p(x_1)p(x_2)p(x_3), \quad \text{No. of params: } 3
      $$

      <p style="color: black"><b>Conditional Independence:</b></p> $$
      X_1 \perp\\!\\!\\!\perp X_2, \\,\\, X_1 \perp\\!\\!\\!\perp X_3, \\,\\, X_2 \perp\\!\\!\\!\perp X_3
      $$
    </td>
  </tr>

  <tr class="bn-row">
    <td>
      <img src="{{ '/assets/images/2025-03-31/graph2.svg' | url }}" alt="BN2" class="bn-image">
    </td>
    <td class="bn-text">
      There is dependency between all nodes in this BN.
      $$
      p(x_1, x_2, x_3) = p(x_3 \vert x_2, x_1)p(x_2 \vert x_1)p(x_1), \quad \text{No. of params: } 7
      $$

      <p style="color: black"><b>Conditional Independence:</b> None</p>
    </td>
  </tr>

  <tr class="bn-row">
    <td>
      <img src="{{ '/assets/images/2025-03-31/graph3.svg' | url }}" alt="BN3" class="bn-image">
    </td>
    <td class="bn-text">
      <!-- <div class="bn-title">BN 3:</div> -->
      There is only partial dependency between the nodes in this BN.
      $$
      p(x_1, x_2, x_3) = p(x_3 \vert x_2)p(x_2 \vert x_1)p(x_1), \quad \text{No. of params: } 5
      $$

      <p style="color: black"><b>Conditional Independence:</b></p> $$
      X_1 \perp\\!\\!\\!\perp X_3 \\, \vert \\, X_2
      $$
    </td>
  </tr>

  <tr class="bn-row">
    <td>
      <img src="{{ '/assets/images/2025-03-31/graph4.svg' | url }}" alt="BN4" class="bn-image">
    </td>
    <td class="bn-text">
      <!-- <div class="bn-title">BN 4:</div> -->
      There is only partial dependency between the nodes in this BN.
      $$
      p(x_1, x_2, x_3) = p(x_3 \vert x_1)p(x_2 \vert x_1)p(x_1)
      $$
      
      <p style="color: black"><b>Conditional Independence:</b></p> $$
      X_2 \perp\\!\\!\\!\perp X_3 \\, \vert \\, X_1
      $$
    </td>
  </tr>

  <tr class="bn-row">
    <td>
      <img src="{{ '/assets/images/2025-03-31/graph5.svg' | url }}" alt="BN5" class="bn-image">
    </td>
    <td class="bn-text">
      <!-- <div class="bn-title">BN 5:</div> -->
      There is only partial dependency between the nodes in this BN.
      $$
      p(x_1, x_2, x_3) = p(x_3 \vert x_2, x_1)p(x_2)p(x_1)
      $$
      
      <p style="color: black"><b>Conditional Independence:</b></p> $$
      X_1 \perp\\!\\!\\!\perp X_2
      $$
    </td>
  </tr>
</table>

Comparing the probability distribution of BN1, BN3-5 with BN2, we find that missing edges between nodes corresponds to missing variables in the local conditonal probability distribution.

The last three BNs shown above are three important canonical graphs involving three random variables: BN3, BN4, and BN5. We will take a closer look at these, since a good understanding of these three simple BNs will be useful in understanding more complex BNs.

<div class="bn-container">
  <div class="bn-description">
    
    <b>BN3</b> $(X_1 \longrightarrow X_2 \longrightarrow X_3)$: Here, $X_1$ is conditionally independent of $X_3$ for a given value of $X_2$. Thus, we can think of this as if $X_2$ is blocking the flow of information between $X_1$ and $X_3$. A simple example (from <a href="https://people.eecs.berkeley.edu/~jordan/prelims/chapter2.pdf" target="_blank">Chapter 02</a> of <i>Introduction to Probabilistic Graphical Models</i> by <i>Michael I. Jordan</i>) is where $X_1$, $X_2$, and $X_3$ represent the past, present, and the future. The past is independent of the future given the present.

    The adjancent plots demonstrates this through an intetractive demo. A simple linear model is assumed between the three random variables:
    $$
    X1 = \epsilon_1, \quad X2 = 2 X1 + \epsilon_2, \quad X3 = -X2 + \epsilon_3
    $$

    where, $\epsilon_1, \epsilon_2 \sim \mathcal{N}(0, 2)$ and $\epsilon_3 \sim \mathcal{N}(0, 3)$. When we don't condition, $X_1$ and $X_2$ are correlated (blue dots); but when we condition on $X_2$, $X_1$ and $X_3$ are independent.
  </div>

  <div class="bn-plot-area">
    <div class="bn-controls">
      <label>
        <input type="checkbox" id="conditionCheckboxBN3">
        Condition on $X_2$
      </label>
      <label>
        <input type="range" id="bSliderBN3" min="-10" max="10" step="0.1" value="0">
        <span id="bValue">0.0</span>
      </label>
    </div>
    <svg class="BNDemo" id="BN3Demo" width="300" height="250"></svg>
  </div>
</div>

<!-- X1 -> X2 -> X3 -->
<!-- ================================ -->
<script>
  function pearsonCorrelation(x, y) {
    const n = x.length;
    const meanX = d3.mean(x);
    const meanY = d3.mean(y);
    const covXY = d3.mean(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
    const stdX = d3.deviation(x);
    const stdY = d3.deviation(y);
    return covXY / (stdX * stdY);
  }
  document.addEventListener("DOMContentLoaded", function () {
    // Simulate data: A → B → C
    const N = 5000;
    const X1 = d3.range(N).map(() => d3.randomNormal(0, 2)());
    const X2 = X1.map(x1 => 2 * x1 + d3.randomNormal(0, 2)());  // X2 = 2X1 + noise
    const X3 = X2.map(x2 => -1 * x2 + d3.randomNormal(0, 3)()); // X3 = -1X2 + noise

    const data = X1.map((a, i) => ({ X1: a, X2: X2[i], X3: X3[i] }));

    const svg = d3.select("#BN3Demo");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().range([0, plotWidth]);
    const yScale = d3.scaleLinear().range([plotHeight, 0]);

    xScale.domain(d3.extent(data, d => d.X1)).nice();
    yScale.domain(d3.extent(data, d => d.X3)).nice();
    
    // Correlation coefficienty text
    const corrText = g.append("text")
      .attr("class", "corr-text")
      .attr("x", 90)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("font-family", "Inter")
      .style("fill", "steelblue");

    const condCorrText = g.append("text")
      .attr("class", "cond-corr-text")
      .attr("x", 130)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("font-family", "Inter")
      .style("fill", "red");

    const xAxis = g.append("g")
                   .attr("transform", `translate(0,${plotHeight})`)
                   .attr("class", "x-axis")
                   .call(d3.axisBottom(xScale))
                   .selectAll("text") // Select all tick labels
                   .style("font-size", "12px")  // Set font size
                   .style("font-family", "Inter")  // Set font type
                   .style("fill", "black");  // Set text color;
    const yAxis = g.append("g")
                   .attr("class", "y-axis")
                   .call(d3.axisLeft(yScale))
                   .selectAll("text") // Select all tick labels
                   .style("font-size", "12px")  // Set font size
                   .style("font-family", "Inter")  // Set font type
                   .style("fill", "black");  // Set text color;;
    // X-axis Label
    g.append("text")
     .attr("class", "x-axis-label")
     .attr("x", plotWidth / 2)
     .attr("y", plotHeight + margin.bottom)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("font-family", "Inter")
     .style("fill", "black")
     .text("X1");
    // Y-axis Label
    g.append("text")
     .attr("class", "x-axis-label")
     .attr("x", 0 - 1.5 * margin.left / 2)
     .attr("y", plotHeight / 2 )
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("font-family", "Inter")
     .style("fill", "black")
     .text("X3");
    

    const updatePlot = () => {
      const condition = document.getElementById("conditionCheckboxBN3").checked;
      document.getElementById("bSliderBN3").disabled = !condition;
      const bTarget = parseFloat(document.getElementById("bSliderBN3").value);
      document.getElementById("bValue").textContent = bTarget.toFixed(1);
      
      // Unconditioned points
      const circles_uncond = g.selectAll("circle").data(data, (d, i) => i);
      circles_uncond.enter()
        .append("circle")
        .attr("r", 2)
        .attr("fill", "steelblue")
        .attr("opacity", 0.3)
        .merge(circles_uncond)
        .attr("cx", d => xScale(d.X1))
        .attr("cy", d => yScale(d.X3));
      circles_uncond.exit().remove();

      if (condition) {
        const eps = 0.2; // bandwidth for approximate conditioning
        let filtered = data.filter(d => Math.abs(d.X2 - bTarget) < eps);
        // Conditioned points
        const circles_cond = g.selectAll("circle.cond").data(filtered, (d, i) => i);
        circles_cond.enter()
          .append("circle")
          .attr("class", "cond")
          .attr("r", 2)
          .attr("fill", "red")
          .attr("opacity", 1.0)
          .merge(circles_cond)
          .attr("cx", d => xScale(d.X1))
          .attr("cy", d => yScale(d.X3));
        // Display Pearson correlation coefficient.
        if (filtered.length > 2) {
          const condCorr = pearsonCorrelation(filtered.map(d => d.X1), filtered.map(d => d.X3));
          condCorrText.text(`${condCorr.toFixed(2)} (X2≈${bTarget.toFixed(1)})`);
        } else {
          condCorrText.text(`Err`);
        }
      } else {
        // Remove conditioned points
        g.selectAll("circle.cond").remove();
        condCorrText.text("");
      }

      // Pearson correlation for full data
      const corr = pearsonCorrelation(data.map(d => d.X1), data.map(d => d.X3));
      corrText.text(`${corr.toFixed(2)}`);
    };
    
    // Initial plot
    updatePlot();

    // Event listeners
    document.getElementById("conditionCheckboxBN3").addEventListener("change", updatePlot);
    document.getElementById("bSliderBN3").addEventListener("input", updatePlot);
  });
</script>

<div class="bn-container">
  <div class="bn-description">
    
    <b>BN4</b> $(X_2 \longleftarrow X_1 \longrightarrow X_3)$: Here, $X_1$ is conditionally independent of $X_3$ for a given value of $X_2$. Thus, we can think of this as if $X_2$ is blocking the flow of information between $X_1$ and $X_3$. Example 5 discussed above represents this, where $X_1 = D$, $X_2 = T_1$, and $X_3 = T_2$. $T_1$ and $T_2$ are independent given the disease status $D$. The node $X_1$ blocks the flow of information between $X_2$ and $X_3$. $X_1$ is a like a hidden or latent variable that "causes" both $X_2$ and $X_3$.
    
    The adjancent plots demonstrates this through an intetractive demo. A simple linear model is assumed between the three random variables:
    $$
    X1 = \epsilon_1, \quad X2 = 2 X1 + \epsilon_2, \quad X3 = 3X2 + \epsilon_3
    $$

    where, $\epsilon_1 \sim \mathcal{N}(0, 3)$, $\epsilon_2 \sim \mathcal{N}(0, 2)$ and $\epsilon_3 \sim \mathcal{N}(0, 4)$. When we don't condition, $X_2$ and $X_3$ are correlated (blue dots); but when we condition on $X_1$, $X_2$ and $X_3$ are independent.
  </div>

  <div class="bn-plot-area">
    <div class="bn-controls">
      <label>
        <input type="checkbox" id="conditionCheckboxBN4">
        Condition on $X_1$
      </label>
      <label>
        <input type="range" id="bSliderBN4" min="-10" max="10" step="0.1" value="0">
        <span id="bValue">0.0</span>
      </label>
    </div>
    <svg class="BNDemo" id="BN4Demo" width="300" height="250"></svg>
  </div>
</div>

<!-- X1 -> X2 -> X3 -->
<!-- ================================ -->
<script>
  document.addEventListener("DOMContentLoaded", function () {
    // Simulate data: A → B → C
    const N = 5000;
    const X1 = d3.range(N).map(() => d3.randomNormal(0, 3)());
    const X2 = X1.map(x1 => 2 * x1 + d3.randomNormal(0, 2)());  // X2 = 2X1 + noise
    const X3 = X1.map(x2 => 3 * x2 + d3.randomNormal(0, 4)());  // X3 = 3X1 + noise

    const data = X1.map((a, i) => ({ X1: a, X2: X2[i], X3: X3[i] }));

    const svg = d3.select("#BN4Demo");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().range([0, plotWidth]);
    const yScale = d3.scaleLinear().range([plotHeight, 0]);

    xScale.domain(d3.extent(data, d => d.X2)).nice();
    yScale.domain(d3.extent(data, d => d.X3)).nice();
    
    // Correlation coefficienty text
    const corrText = g.append("text")
      .attr("class", "corr-text")
      .attr("x", 90)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("font-family", "Inter")
      .style("fill", "steelblue");

    const condCorrText = g.append("text")
      .attr("class", "cond-corr-text")
      .attr("x", 130)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("font-family", "Inter")
      .style("fill", "red");

    const xAxis = g.append("g")
                   .attr("transform", `translate(0,${plotHeight})`)
                   .attr("class", "x-axis")
                   .call(d3.axisBottom(xScale))
                   .selectAll("text") // Select all tick labels
                   .style("font-size", "12px")  // Set font size
                   .style("font-family", "Inter")  // Set font type
                   .style("fill", "black");  // Set text color;
    const yAxis = g.append("g")
                   .attr("class", "y-axis")
                   .call(d3.axisLeft(yScale))
                   .selectAll("text") // Select all tick labels
                   .style("font-size", "12px")  // Set font size
                   .style("font-family", "Inter")  // Set font type
                   .style("fill", "black");  // Set text color;;
    // X-axis Label
    g.append("text")
     .attr("class", "x-axis-label")
     .attr("x", plotWidth / 2)
     .attr("y", plotHeight + margin.bottom)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("font-family", "Inter")
     .style("fill", "black")
     .text("X2");
    // Y-axis Label
    g.append("text")
     .attr("class", "x-axis-label")
     .attr("x", 0 - 1.5 * margin.left / 2)
     .attr("y", plotHeight / 2 )
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("font-family", "Inter")
     .style("fill", "black")
     .text("X3");
    
    const updatePlotBN4 = () => {
      const condition = document.getElementById("conditionCheckboxBN4").checked;
      document.getElementById("bSliderBN4").disabled = !condition;
      const bTarget = parseFloat(document.getElementById("bSliderBN4").value);
      document.getElementById("bValue").textContent = bTarget.toFixed(1);
      
      // Unconditioned points
      const circles_uncond = g.selectAll("circle").data(data, (d, i) => i);
      circles_uncond.enter()
        .append("circle")
        .attr("r", 2)
        .attr("fill", "steelblue")
        .attr("opacity", 0.3)
        .merge(circles_uncond)
        .attr("cx", d => xScale(d.X2))
        .attr("cy", d => yScale(d.X3));
      circles_uncond.exit().remove();

      if (condition) {
        const eps = 0.2; // bandwidth for approximate conditioning
        let filtered = data.filter(d => Math.abs(d.X1 - bTarget) < eps);
        // Conditioned points
        const circles_cond = g.selectAll("circle.cond").data(filtered, (d, i) => i);
        circles_cond.enter()
          .append("circle")
          .attr("class", "cond")
          .attr("r", 2)
          .attr("fill", "red")
          .attr("opacity", 1.0)
          .merge(circles_cond)
          .attr("cx", d => xScale(d.X2))
          .attr("cy", d => yScale(d.X3));
        // Display Pearson correlation coefficient.
        if (filtered.length > 2) {
          const condCorr = pearsonCorrelation(filtered.map(d => d.X2), filtered.map(d => d.X3));
          condCorrText.text(`${condCorr.toFixed(2)} (X1≈${bTarget.toFixed(1)})`);
        } else {
          condCorrText.text(`Err`);
        }
      } else {
        // Remove conditioned points
        g.selectAll("circle.cond").remove();
        condCorrText.text("");
      }

      // Pearson correlation for full data
      const corr = pearsonCorrelation(data.map(d => d.X2), data.map(d => d.X3));
      corrText.text(`${corr.toFixed(2)}`);
    };
    
    // Initial plot
    updatePlotBN4();

    // Event listeners
    document.getElementById("conditionCheckboxBN4").addEventListener("change", updatePlotBN4);
    document.getElementById("bSliderBN4").addEventListener("input", updatePlotBN4);
  });
</script>

<div class="bn-container">
  <div class="bn-description">
    
    <b>BN5</b> $(X_1 \longrightarrow X_3 \longleftarrow X_2)$: This is an interesting scenario. $X_1$ and $X_2$ are unconditionally independent. However, if we know the value of $X_3$, then $X_1$ and $X_2$ are become dependent. This is called <i>explaining away</i>. A simple example of this is the following. Let $X_3 = X_1 + X_2$, where $X_1$ and $X_2$ can take on any value real value between $0$ and $1$. When we don't know the value of $X_3$, $X_1$ and $X_2$ can take on any value between $0$ and $1$, and are independent of each other. But once we know the value of $X_3$, knowledge of $X_1$ tells us the value of $X_2$, and vice versa. Nornally, the flow of information is blocked by the node $X_3$, which is also called a <i>collider</i>, becuase two or more arrows point to the node. A collider will usually block the flow of information between its parents, unless we conditions on the collider or its descendants. When we condition, the collider opens the flow of information between its parents.
    
    The adjancent plots demonstrates this through an intetractive demo. A simple linear model is assumed between the three random variables:
    $$
    X1 = \epsilon_1, \quad X2 = \epsilon_2, \quad X3 = 1.5X_1 + X2 + \epsilon_3
    $$

    where, $\epsilon_1 \sim \mathcal{N}(0, 3)$, $\epsilon_2 \sim \mathcal{N}(0, 4)$ and $\epsilon_3 \sim \mathcal{N}(0, 2)$. When we don't condition, $X_1$ and $X_2$ are independent (blue dots); but when we condition on $X_3$, $X_1$ and $X_2$ are dependent.
  </div>

  <div class="bn-plot-area">
    <div class="bn-controls">
      <label>
        <input type="checkbox" id="conditionCheckboxBN5">
        Condition on $X_1$
      </label>
      <label>
        <input type="range" id="bSliderBN5" min="-20" max="20" step="0.1" value="0">
        <span id="bValue">0.0</span>
      </label>
    </div>
    <svg class="BNDemo" id="BN5Demo" width="300" height="250"></svg>
  </div>
</div>

<!-- X1 -> X2 -> X3 -->
<!-- ================================ -->
<script>
  document.addEventListener("DOMContentLoaded", function () {
    // Simulate data: A → B → C
    const N = 5000;
    const X1 = d3.range(N).map(() => d3.randomNormal(0, 3)());
    const X2 = d3.range(N).map(() => d3.randomNormal(0, 4)());
    const X3 = X1.map((x1, i) => 1.5 * x1 + 1 * X2[i] + d3.randomNormal(0, 2)());  // X3 = 3X1 + noise

    const data = X1.map((a, i) => ({ X1: a, X2: X2[i], X3: X3[i] }));

    const svg = d3.select("#BN5Demo");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().range([0, plotWidth]);
    const yScale = d3.scaleLinear().range([plotHeight, 0]);

    xScale.domain(d3.extent(data, d => d.X1)).nice();
    yScale.domain(d3.extent(data, d => d.X2)).nice();
    
    // Correlation coefficienty text
    const corrText = g.append("text")
      .attr("class", "corr-text")
      .attr("x", 90)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("font-family", "Inter")
      .style("fill", "steelblue");

    const condCorrText = g.append("text")
      .attr("class", "cond-corr-text")
      .attr("x", 130)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("font-family", "Inter")
      .style("fill", "red");

    const xAxis = g.append("g")
                   .attr("transform", `translate(0,${plotHeight})`)
                   .attr("class", "x-axis")
                   .call(d3.axisBottom(xScale))
                   .selectAll("text") // Select all tick labels
                   .style("font-size", "12px")  // Set font size
                   .style("font-family", "Inter")  // Set font type
                   .style("fill", "black");  // Set text color;
    const yAxis = g.append("g")
                   .attr("class", "y-axis")
                   .call(d3.axisLeft(yScale))
                   .selectAll("text") // Select all tick labels
                   .style("font-size", "12px")  // Set font size
                   .style("font-family", "Inter")  // Set font type
                   .style("fill", "black");  // Set text color;;
    // X-axis Label
    g.append("text")
     .attr("class", "x-axis-label")
     .attr("x", plotWidth / 2)
     .attr("y", plotHeight + margin.bottom)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("font-family", "Inter")
     .style("fill", "black")
     .text("X1");
    // Y-axis Label
    g.append("text")
     .attr("class", "x-axis-label")
     .attr("x", 0 - 1.5 * margin.left / 2)
     .attr("y", plotHeight / 2 )
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("font-family", "Inter")
     .style("fill", "black")
     .text("X2");
    
    const updatePlotBN5 = () => {
      const condition = document.getElementById("conditionCheckboxBN5").checked;
      document.getElementById("bSliderBN5").disabled = !condition;
      const bTarget = parseFloat(document.getElementById("bSliderBN5").value);
      document.getElementById("bValue").textContent = bTarget.toFixed(1);
      
      // Unconditioned points
      const circles_uncond = g.selectAll("circle").data(data, (d, i) => i);
      circles_uncond.enter()
        .append("circle")
        .attr("r", 2)
        .attr("fill", "steelblue")
        .attr("opacity", 0.3)
        .merge(circles_uncond)
        .attr("cx", d => xScale(d.X1))
        .attr("cy", d => yScale(d.X2));
      circles_uncond.exit().remove();

      if (condition) {
        const eps = 0.2; // bandwidth for approximate conditioning
        let filtered = data.filter(d => Math.abs(d.X3 - bTarget) < eps);
        // Conditioned points
        const circles_cond = g.selectAll("circle.cond").data(filtered, (d, i) => i);
        circles_cond.enter()
          .append("circle")
          .attr("class", "cond")
          .attr("r", 2)
          .attr("fill", "red")
          .attr("opacity", 1.0)
          .merge(circles_cond)
          .attr("cx", d => xScale(d.X1))
          .attr("cy", d => yScale(d.X2));
        // Display Pearson correlation coefficient.
        if (filtered.length > 2) {
          const condCorr = pearsonCorrelation(filtered.map(d => d.X1), filtered.map(d => d.X2));
          condCorrText.text(`${condCorr.toFixed(2)} (X3≈${bTarget.toFixed(1)})`);
        } else {
          condCorrText.text(`Err`);
        }
      } else {
        // Remove conditioned points
        g.selectAll("circle.cond").remove();
        condCorrText.text("");
      }

      // Pearson correlation for full data
      const corr = pearsonCorrelation(data.map(d => d.X1), data.map(d => d.X2));
      corrText.text(`${corr.toFixed(2)}`);
    };
    
    // Initial plot
    updatePlotBN5();

    // Event listeners
    document.getElementById("conditionCheckboxBN5").addEventListener("change", updatePlotBN5);
    document.getElementById("bSliderBN5").addEventListener("input", updatePlotBN5);
  });
</script>
