const sortByName =
    list => list.sort(
        (a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    );

export default sortByName;