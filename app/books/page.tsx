export default function Books() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-4 tracking-tighter">Books</h1>
      <h2 className="text-xl font-semibold mb-2">Currently Reading</h2>
      <div className="flex flex-col mb-4">
        <div>
          <span className="italic">Barbarians at the Gate</span> - Burrough and
          Helyar
        </div>
        <div>
          <span className="italic">Truman</span> - McCullough
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Next Up</h2>
      <div className="flex flex-col mb-4">
        <div>
          <span className="italic">In Cold Blood</span> - Capote
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Finished</h2>
      <div className="flex flex-col mb-4 ">
        <div>
          <span className="italic">Eruption</span> - Crichton and Patterson
        </div>
        <div>
          <span className="italic">Florida Roadkill</span> - Dorsey
        </div>
        <div>
          <span className="italic">Hell's Angels</span> - Hunter S. Thompson
        </div>
        <div>
          <span className="italic">Lonesome Dove</span> - McMurtry
        </div>
        <div>
          <span className="italic">The Box</span> - Levinson
        </div>
      </div>
    </section>
  );
}
