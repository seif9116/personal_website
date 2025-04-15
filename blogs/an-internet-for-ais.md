## An Internet for AIs

Most people, myself included, find user interfaces incredibly infuriating for certain tasks. A setting buried in an un-intuitive nest of options, a form that clears my responses after complaining about a phone number format. It's the worst. On the other-hand, seeing a Stripe or PayPal Checkout brings me immediate relief. It's a familiar, stable and reliable interface. As AI agents consume an increasing proportion of web traffic on our behalf, what will become of the half-baked wheel re-inventions of payment forms and booking logic that bring us suffering? Hopefully, through an emergent normalization process caused by AI agents suffering the same reliability issues as us, Claude and I can both surft the web across a standardized oasis.

### A New Kind of Website

What might the application layer look like when reoriented to serve AIs? We can hope UI designers will radically simplify their designs. A renaissance of 2000s style front-ends with simple, bounded components might flourish for practical reasons. We may even see an  emergence of a *standard* of UI. If you're building a website which needs to be accessible to AIs foremost, and the Stripe checkout guarantees reliability with X, Y and Z agent models, then presenting something custom has all the risk and no reward. 

### The Dynamic Hurdle

AI agents would have a much simpler time if the set of logical actions one could take upon the initial request of a web-page were actually present in the response. Suppose I make a fetch to `amazon.com` I was surprised to see, something which I'm sure won't shock any web-developers out there, that nothing in this request useful to my task of "buying a laptop."

```shell
curl -X GET https://www.amazon.ca/ > amazon.html
```

Pretty much everything on the web is dynamically injected. This means AIs have to operate at the visual level! Thankfully agents are becoming multi-modal and increasingly cheap. Nonetheless, several common dynamic UI practices may be pressured out of the norm.

- Lazy Loading: Content which is loaded only when it enters the user's view-port (e.g scrolling atop of it) is already unintuitive for many humans, and will be too for AIs.

- Layers of indirection: An agent can fail during any action on average with probability `p`. The best designs will (and many already do), minimize clicks to goal.

### The Reliability Hurdle

In Agentic AI there will always be edges cases which produce failure. At at certain point, we must consider the case itself as part of the problem. At what point in the self-driving pursuit, after chasing endless elusive misbehaviour's in say, left-hand turns, do we consider revising the rules of the road to improve reliability? Maybe left-hand turns are inherently a bad design, encouraging us turn blindingly into oncoming traffic. I hope the internet may follow a similar trend. Thankfully digital infrastructure is easier to rewrite than physical.

### Speculative Thoughts

In the limit, the HTTP layer may be submerged benath the top of the OSI stack entirely. What does layer 8 look like? Right now my LLM asynchronously fetches websites and reiterates what it finds into the response. In the future, when models can reliable extract standardized components, I may be able to perform actions without ever visiting the underlying site. For example, my AI presents the form filled out. I can edit and click submit. (I still, like most sane people, don't actually want an AI ever clicking submit.) In this world, the UI standardization process forms a bottleneck. Below, by a natural pressure for reliability, the web conforms to a relatively restricted *language* of functional component design. On top, the boring, predictable intermediate representation can be reshaped to match the clients aesthetic preferences. Imagine surfing a web where each site, from Amazon, to YouTube, is dynamically re-rendered in your favourite retro 2000's skin. We might call layer 8, the *render layer*.

