---
title: "Introduction to Bayesian Networks"
date: "2025-03-17"
layout: "post.njk"  # Must match exactly with `post.njk`
author: "Sivakumar Balasubramanian"
tags: ["blog"]
---
<style>
  svg {
    display: block;
    margin: auto;
  }

  .button-container {
    display: flex;           /* Use flexbox for layout */
    justify-content: center; /* Center-align buttons horizontally */
    align-items: center;     /* Center-align buttons vertically (if needed) */
    margin-top: 20px;        /* Add some space above the buttons */
  }
</style>
<link rel="stylesheet" href="{{ '/assets/css/2025-03-17-bn.css' | url }}">

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.1/math.min.js"></script>

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
      var pPosterior = testResult == 1 ?  (pTruePos * pPrior) / pTest : (pFalsePos * pPrior) / pTest;
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

Almost all real-world problems we deal with require us to deal with: (a) deal with multiple variables with complex interactions, (b) each variable has some uncertainity associated with, and (c) require us to make some decision based on some partially observed or available information. Bayesian networks are a powerful tool that can help us represents such complex systems, and provide pricipled approaches for make informed decisions. In this post, we will provide a short introduction to Bayesian networks, and show how they can be used to model complex systems and make decisions. Bayesian networks are a type of probabilistic graphical model and are a stepping stone to causal inference --  a topic of great interest to the author.

<!-- Note in small text in a box -->
<div class="note">
    <p><b>Note:</b> This post is a work in progress. Please check back later for more content.</p>
</div>

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

While the marginal probabilities tell us the probability of the individual random variables, irrespective of the other. <i>Conditional probability</i> tells us the probability of one random variable, when the value of another random variable is known. The conditional probability of $X$ given $Y$ is denoted by $p(X=x \vert Y=y)$ or $p(x \vert y)$ and is given by,

$$
p\left(x \\, \vert \\, y\right) = \frac{p\left(x, y\right)}{p\left( y \right)}, \quad p(y) \neq 0
$$

The reader must note the following points.
1. $p( x \vert y)$ can be thought of a function of $x$ for a given vaues of $y$.
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

Let's look at an interactive demonstration of Baye's rule. The following interactive demo of a commonly used "medical" example of the Baye's rule. We have a subject who take a test $T$ for a disease $D$. The test outcome and the disease state are binary random variables; the test outcome is positive (1) or negative (0), and th subject can either have (1) or not have (0) the disease. The disease has an incidence rate of $p(D = 1)$ in the population - the <i>prior probability</i>. The test for the disease is not perfect; it has a some known <i>true positive rate</i> $p(T = 1 \\, \vert \\, D = 1)$ and a <i>false positive rate</i> $p(T = 1 \\, \vert \\, D = 0)$. The follow demo allows us to compute the <i>posterior proability</i> of the subject having the disease after we know the test resultm, i.e., $p( D = 1 \\, \vert \\, T = 1)$ or $p( D = 1 \\, \vert \\, T = 0)$.

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

You can play around with the sliders above to compute the posterior probability of a person having . The sliders represent the following probabilities:
<div class="question-box">
<ol class="question">
  <li>How can we verify this is true?</li>
</ol>
</div>